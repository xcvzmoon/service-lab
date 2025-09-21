import Database from '@tauri-apps/plugin-sql';

// [windows] dir: C:\Users\user\AppData\Roaming\com.service-lab.dev
const db = await Database.load('sqlite:service-lab.db');

export function useService() {
  async function reset() {
    await db.execute('DROP TABLE IF EXISTS services');
    await init();
  }

  async function init() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS services (
          uuid TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          status TEXT NOT NULL,
          path TEXT NOT NULL,
          proxy TEXT NOT NULL,
          directory TEXT NOT NULL
        )
    `);

    const tables = (await db.select(`
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='services'
      `)) as { name: string }[];

    if (!tables.length || !tables.some(({ name }) => name === 'services')) {
      throw new Error('Tables were not created properly or do not exist');
    }
  }

  async function select(uuids?: string | string[]) {
    if (!uuids) {
      return (await db.select(
        'SELECT uuid, name, status, path, proxy, directory FROM services',
      )) as Service[];
    }

    const uuidArray = Array.isArray(uuids) ? uuids : [uuids];
    const placeholders = uuidArray.map((_, i) => `$${i + 1}`).join(', ');
    return (await db.select(
      `SELECT uuid, name, status, path, proxy, directory FROM services WHERE uuid IN (${placeholders})`,
      uuidArray,
    )) as Service[];
  }

  async function insert(services: Service | Service[]) {
    if (Array.isArray(services)) {
      const placeholders = services
        .map((_, i) => {
          return `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`;
        })
        .join(', ');
      return await db.execute(
        `INSERT into services (uuid, name, status, path, proxy, directory) VALUES ${placeholders}`,
        services.flat(),
      );
    }

    return await db.execute(
      'INSERT into services (uuid, name, status, path, proxy, directory) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        services.uuid,
        services.name,
        services.status,
        services.path,
        services.proxy,
        services.directory,
      ],
    );
  }

  async function update(service: Service) {
    return await db.execute(
      'UPDATE services SET name = $1, status = $2, path = $3, proxy = $4, directory = $5 WHERE uuid = $6',
      [service.name, service.status, service.path, service.proxy, service.directory, service.uuid],
    );
  }

  async function remove(uuid: string | string[]) {
    if (Array.isArray(uuid)) {
      const placeholders = uuid.map((_, i) => `$${i + 1}`).join(', ');
      return await db.execute(`DELETE FROM services WHERE uuid IN (${placeholders})`, uuid);
    }

    return await db.execute('DELETE FROM services WHERE uuid = $1', [uuid]);
  }

  async function toggleStatus(uuid: string) {
    return await db.execute(
      `
      UPDATE services 
      SET status = CASE 
        WHEN status = 'running' THEN 'idle' 
        WHEN status = 'idle' THEN 'running' 
        ELSE status 
      END 
      WHERE uuid = $1
    `,
      [uuid],
    );
  }

  return {
    reset,
    init,
    select,
    insert,
    update,
    remove,
    toggleStatus,
  };
}
