<script setup lang="ts">
import { v7 as uuidv7 } from 'uuid';
import { open } from '@tauri-apps/plugin-dialog';

const refresh = inject<() => Promise<void>>('refresh');

const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const service = useService();
const drawerState = useState<ServiceDrawerState>('drawer', () => ({
  open: false,
  operation: 'insert',
}));

const state = ref<Service>();

const title = computed<string>(() => {
  return drawerState.value.operation === 'insert'
    ? `Create New Service`
    : `Edit ${drawerState.value.service!.name}`;
});

async function selectDirectory() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Directory',
    });

    if (selected && typeof selected === 'string') {
      state.value!.directory = selected;
    }
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-folder',
      title: 'Directory: Directory Selection',
      description:
        error instanceof Error ? error.message : 'An error occurred while selecting the directory.',
    });
  }
}

async function onSubmit() {
  if (!state.value || !refresh) return;

  try {
    await service.update(state.value);
    await refresh();

    drawerState.value.open = false;
    toast.add({
      color: 'success',
      icon: 'i-lucide-folder',
      title: `Service: Update ${state.value.name}`,
      description: `Successfully updated ${state.value.name}`,
    });
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-folder',
      title: `Service: Update ${state.value.name}`,
      description:
        error instanceof Error ? error.message : 'An error occurred while updating service',
    });
  }
}

watch(
  () => drawerState.value.open,
  (open) => {
    if (open) {
      state.value =
        drawerState.value.operation === 'insert'
          ? {
              uuid: uuidv7(),
              name: '',
              status: 'idle',
              path: '',
              proxy: runtimeConfig.public.defaultRoute,
              directory: '',
            }
          : { ...drawerState.value.service! };
    } else {
      state.value = undefined;
    }
  },
  { immediate: true },
);
</script>

<template>
  <UDrawer
    v-model:open="drawerState.open"
    :dismissible="false"
    :handle="false"
    :ui="{
      content: 'w-[60svw]',
      header: 'flex items-center justify-between',
      body: 'pt-8',
    }"
    :title
    direction="right"
    inset
  >
    <template #body>
      <UForm
        v-if="state"
        :schema="serviceSchema"
        :state
        class="flex h-full flex-col gap-4"
        @submit="onSubmit"
      >
        <UFormField
          label="UUID"
          name="uuid"
        >
          <UInput
            v-model="state.uuid"
            class="w-full"
            disabled
          />
        </UFormField>

        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="state.name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Status"
          name="status"
        >
          <USelect
            v-model="state.status"
            :items="['running', 'idle']"
            :disabled="drawerState.operation === 'insert'"
            :ui="{ itemLabel: 'capitalize' }"
            class="w-full capitalize"
          />
        </UFormField>

        <UFormField
          label="Path"
          name="path"
        >
          <UInput
            v-model="state.path"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Proxy"
          name="proxy"
        >
          <UInput
            v-model="state.proxy"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Directory"
          name="directory"
        >
          <UButton
            :label="state.directory || 'Select directory'"
            color="neutral"
            variant="outline"
            class="w-full"
            @click="selectDirectory"
          />
        </UFormField>

        <div class="mt-auto flex items-center justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="drawerState.open = false"
          />

          <UButton
            :label="drawerState.operation === 'insert' ? 'Create' : 'Save'"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UDrawer>
</template>
