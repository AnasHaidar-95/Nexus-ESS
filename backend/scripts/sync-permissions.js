// scripts/sync-permissions.js
import { prisma } from '../src/core/utils/prisma.js';
import { PERMISSIONS } from '../src/core/constants/permissions.js';
import { invalidatePermissionsCache } from '../src/core/utils/permission-cache.js';

async function syncPermissions() {
  console.log('🔄 Syncing permissions manifest to database...');

  // Flatten the nested PERMISSIONS object into an array of { module, code }
  const manifestPermissions = [];
  for (const [module, actions] of Object.entries(PERMISSIONS)) {
    for (const action of Object.values(actions)) {
      manifestPermissions.push({
        code: action,
        module: module.toLowerCase(),
        name: action.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // e.g. "Employees Read"
        isSystem: true
      });
    }
  }

  // Add the Wildcard permission for SuperAdmins
  manifestPermissions.push({
    code: '*',
    module: 'system',
    name: 'Super Admin (Full Access)',
    description: 'Bypasses all authorization checks.',
    isSystem: true
  });

  let created = 0;
  let updated = 0;

  for (const perm of manifestPermissions) {
    const result = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module }, // Update name/module if changed in code
      create: perm
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) created++;
    else updated++;
  }

  // Optional: Find permissions in DB that are NO LONGER in the manifest (deprecated)
  const dbPermissions = await prisma.permission.findMany({ select: { code: true } });
  const manifestCodes = manifestPermissions.map(p => p.code);
  const deprecated = dbPermissions.filter(p => !manifestCodes.includes(p.code));
  
  if (deprecated.length > 0) {
    console.warn(`⚠️ Found ${deprecated.length} permissions in DB that are missing from the code manifest.`);
    // In a strict enterprise setup, you might soft-delete them here.
  }

  console.log(`✅ Sync complete: ${created} created, ${updated} updated.`);
  
  await invalidatePermissionsCache();
  process.exit(0);
}

syncPermissions().catch(console.error);