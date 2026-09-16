/**
 * SiteSync Data Integrity & Orphan Detection Runner (Master Prompt 12)
 * Runs referential integrity checks across the canonical project model.
 */

import { generateSyntheticProject } from '../src/lib/data/syntheticGenerator';
import { DataIntegrityService } from '../apps/api/src/modules/integrity/data-integrity.service';

async function main() {
  console.log('🔍 [SiteSync Data Integrity] Auditing canonical project state...\n');

  const synthetic = generateSyntheticProject();
  const integrityService = new DataIntegrityService();

  const report = integrityService.auditProjectIntegrity({
    projectId: synthetic.project.id,
    activities: synthetic.activities,
    wbsNodes: synthetic.wbsNodes,
    dependencies: synthetic.dependencies,
    reports: synthetic.fieldReports,
    progressUpdates: [],
  });

  console.log(`  Audited Activities:    ${report.validationMetrics.activitiesAudited}`);
  console.log(`  Audited WBS Nodes:     ${report.validationMetrics.wbsNodesAudited}`);
  console.log(`  Audited Dependencies:  ${report.validationMetrics.dependenciesAudited}`);
  console.log(`  Audited Field Reports: ${report.validationMetrics.reportsAudited}`);
  console.log(`  Total Checks Run:      ${report.totalChecks}`);
  console.log(`  Integrity Violations:  ${report.violationsCount}`);
  console.log(`  Quality Score:         ${report.qualityScorePercentage}%\n`);

  if (report.violationsCount === 0) {
    console.log('✅ 100% Data Integrity: All foreign keys, WBS lineages, and dependency graphs valid.');
  } else {
    console.warn(`⚠️ Detected ${report.violationsCount} referential integrity violations:`);
    report.orphanedEntities.forEach((e) => {
      console.warn(`  - [${e.severity}] ${e.entityType} ${e.entityId}: ${e.details}`);
    });
  }

  console.log(`\n======================================================`);
  console.log(`Integrity Audit Finished at: ${report.generatedAt}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('Integrity audit failed:', err);
  process.exit(1);
});
