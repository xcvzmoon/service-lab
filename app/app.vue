<script setup lang="ts">
const toast = useToast();
const service = useService();

const services = useState<Service[]>('services', () => []);
const drawerState = useState<ServiceDrawerState>('drawer', () => ({
  open: false,
  operation: 'insert',
}));
const { execute, refresh } = await useLazyAsyncData('service:all', async () => {
  try {
    services.value = await service.select();
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-folder-x',
      title: 'Service: Service Retrieval',
      description:
        error instanceof Error ? error.message : 'An error occurred while getting the services.',
    });

    return [];
  }
});

provide('refresh', refresh);
await callOnce(async () => {
  try {
    await service.init();
    await execute();

    toast.add({
      color: 'success',
      icon: 'i-lucide-database',
      title: 'Database: Database Initialization',
      description: 'Database initialized successfully.',
    });
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-database',
      title: 'Database: Database Initialization',
      description: error instanceof Error ? error.message : 'Failed to initialize database',
    });
  }
});
</script>

<template>
  <UApp>
    <NuxtLayout />
    <ServiceDrawer
      v-model="drawerState.open"
      :operation="drawerState.operation"
    />
  </UApp>
</template>
