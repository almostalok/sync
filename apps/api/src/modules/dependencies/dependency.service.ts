import { DependencyDTO, DependencyType } from '@sitesync/types';
import { CreateDependencyInput, validateCreateDependency } from '@sitesync/validation';
import { generateId } from '@sitesync/utils';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export class DependencyRepository {
  private inMemoryDependencies = new Map<string, DependencyDTO>();

  constructor() {
    const synthetic = generateSyntheticProject();
    synthetic.dependencies.forEach(d => {
      this.inMemoryDependencies.set(d.id, {
        id: d.id,
        projectId: d.projectId,
        predecessorId: d.predecessorId,
        successorId: d.successorId,
        type: d.dependencyType as DependencyType,
        lag: d.lag,
        createdAt: new Date(),
      });
    });
  }

  async findByProjectId(projectId: string): Promise<DependencyDTO[]> {
    return Array.from(this.inMemoryDependencies.values()).filter(d => d.projectId === projectId);
  }

  async findDuplicate(projectId: string, predecessorId: string, successorId: string): Promise<DependencyDTO | null> {
    for (const d of this.inMemoryDependencies.values()) {
      if (d.projectId === projectId && d.predecessorId === predecessorId && d.successorId === successorId) {
        return d;
      }
    }
    return null;
  }

  async create(dependency: DependencyDTO): Promise<DependencyDTO> {
    this.inMemoryDependencies.set(dependency.id, dependency);
    return dependency;
  }
}

export class DependencyService {
  constructor(private readonly depRepo: DependencyRepository = new DependencyRepository()) {}

  async getDependenciesByProject(projectId: string): Promise<DependencyDTO[]> {
    return this.depRepo.findByProjectId(projectId);
  }

  async createDependency(input: unknown): Promise<{ success: boolean; data?: DependencyDTO; errors?: string[] }> {
    const validation = validateCreateDependency(input);
    if (!validation.valid || !validation.data) {
      return { success: false, errors: validation.errors };
    }

    const { projectId, predecessorId, successorId, type, lag } = validation.data;

    // Check duplicate dependency
    const existing = await this.depRepo.findDuplicate(projectId, predecessorId, successorId);
    if (existing) {
      return { success: false, errors: [`Dependency between '${predecessorId}' and '${successorId}' already exists`] };
    }

    const dep: DependencyDTO = {
      id: generateId('DEP'),
      projectId,
      predecessorId,
      successorId,
      type: type || DependencyType.FS,
      lag: lag || 0,
      createdAt: new Date(),
    };

    const saved = await this.depRepo.create(dep);
    return { success: true, data: saved };
  }
}
