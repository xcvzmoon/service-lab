<script setup lang="ts">
import { Command } from '@tauri-apps/plugin-shell';
import { capitalize } from 'vue';

const props = defineProps<{ content: Service }>();
const refresh = inject<() => Promise<void>>('refresh');

const runtimeConfig = useRuntimeConfig();
const service = useService();
const toast = useToast();
const drawerState = useState<ServiceDrawerState>('drawer', () => ({
  open: false,
  operation: 'insert',
}));

const gitStatus = ref<string>();

const canBeProxied = computed<boolean>(() => {
  const route = runtimeConfig.public.defaultRoute;
  return route !== props.content.proxy;
});

function onClick() {
  drawerState.value.service = props.content;
  drawerState.value.operation = 'update';
  drawerState.value.open = true;
}

async function toggleStatus() {
  if (!refresh) return;

  try {
    const status = props.content.status === 'idle' ? 'running' : 'idle';
    const updatedService = await service.toggleStatus(props.content.uuid);

    if (updatedService.rowsAffected) {
      toast.add({
        color: 'success',
        icon: 'i-lucide-folder',
        title: `Service: Update ${props.content.name}`,
        description: `Successfully set status to ${status}`,
      });

      await refresh();
      return;
    }

    toast.add({
      color: 'error',
      icon: 'i-lucide-folder',
      title: `Service: Update ${props.content.name}`,
      description: `Failed to set status to ${status}`,
    });
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-folder',
      title: `Service: Update ${props.content.name}`,
      description:
        error instanceof Error ? error.message : 'An error occurred while updating the status.',
    });
  }
}

watch(
  () => props.content,
  async () => {
    if (!props.content.directory) return;

    const branch = 'master';
    const cwd = { cwd: props.content.directory };

    try {
      const localHashCommand = Command.create('git', ['rev-parse', branch], cwd);
      const localHash = await localHashCommand.execute();

      if (localHash.stderr) {
        gitStatus.value = capitalize(localHash.stderr.slice(7));
      } else {
        const status = await Command.create('git', ['status'], cwd).execute();
        const statusLines = status.stdout.split('\n').filter((line) => line.trim());

        if (statusLines.length >= 2) {
          const branchLine = statusLines[0];
          const statusLine = statusLines[1];
          const branchMatch = branchLine?.match(/On branch (.+)/);
          const branchName = branchMatch ? branchMatch[1] : 'unknown';

          let statusMessage = 'unknown status';
          if (statusLine?.includes('up to date')) {
            statusMessage = statusLine.replace('Your branch is ', '').replace('.', '');
          } else if (statusLine?.includes('ahead')) {
            statusMessage = statusLine.replace('Your branch is ', '').replace('.', '');
          } else if (statusLine?.includes('behind')) {
            statusMessage = statusLine.replace('Your branch is ', '').replace('.', '');
          }

          gitStatus.value = `[${branchName}] ${statusMessage}`;
        } else {
          gitStatus.value = 'Unable to parse git status';
        }
      }
    } catch (error) {
      toast.add({
        color: 'error',
        icon: 'i-lucide-git-branch',
        title: 'GIT: Branch Status',
        description:
          (error as Error).message || 'An error occurred while checking the branch status.',
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <li
    class="bg-muted/40 border-muted/40 hover:border-muted hover:bg-muted group relative flex-1 cursor-pointer border"
    @click="onClick"
  >
    <div class="flex h-9 items-center justify-between gap-2 ps-3 pe-1">
      <div class="group-hover:text-primary flex h-9 items-center gap-2">
        <UIcon name="i-lucide-folder" />
        <p class="space-x-1 text-xs">
          <span>{{ props.content.name }}</span>
          <span class="capitalize">({{ props.content.status }})</span>
        </p>
      </div>

      <UButton
        v-if="canBeProxied"
        :color="props.content.status === 'running' ? 'error' : 'success'"
        :icon="props.content.status === 'running' ? 'i-lucide-pause' : 'i-lucide-play'"
        variant="subtle"
        @click="toggleStatus"
      />
    </div>

    <ul
      class="border-muted/40 bg-default/60 text-muted group-hover:border-muted space-y-2 border-t p-3 text-xs [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_p]:h-4 [&_p]:w-[calc(100svw-5rem)] [&_p]:truncate"
    >
      <li>
        <UIcon name="i-lucide-link" />
        <p>{{ props.content.path }}</p>
      </li>

      <li>
        <UIcon name="i-lucide-waypoints" />
        <p>{{ props.content.proxy }}</p>
      </li>

      <li>
        <UIcon name="i-lucide-folder-symlink" />
        <p>{{ props.content.directory }}</p>
      </li>

      <li>
        <UIcon name="i-lucide-git-branch" />
        <p>{{ gitStatus }}</p>
      </li>
    </ul>
  </li>
</template>
