<script setup lang="ts">
const services = useState<Service[]>('services', () => []);
</script>

<template>
  <main class="h-svh p-4 pe-[0.1875rem]">
    <div>
      <p>Gateway</p>
    </div>

    <div>
      <p>Services</p>

      <ScrollArea
        v-if="services"
        mount="vertical"
        class="mt-2 h-[calc(100svh_-_5.5rem)]"
      >
        <ul class="space-y-4 pe-[0.8125rem]">
          <ServiceCard
            v-for="item in services"
            :key="item.uuid"
            :content="item"
          />
        </ul>
      </ScrollArea>

      <div
        v-else
        class="mt-2 grid h-[calc(100svh_-_5.5rem)] place-items-center"
      >
        <p class="text-dimmed">No services available</p>
      </div>
    </div>
  </main>
</template>
