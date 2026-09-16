import { ProjectDTO } from '@sitesync/types';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export class ProjectRepository {
  private inMemoryProjects = new Map<string, ProjectDTO>();

  constructor() {
    const synthetic = generateSyntheticProject();
    this.inMemoryProjects.set(synthetic.project.id, {
      ...synthetic.project,
      code: synthetic.project.projectCode,
      startDate: new Date(synthetic.project.plannedStart),
      plannedEndDate: new Date(synthetic.project.plannedFinish),
      actualEndDate: synthetic.project.actualFinish ? new Date(synthetic.project.actualFinish) : null,
      createdAt: new Date(synthetic.project.createdAt),
      updatedAt: new Date(synthetic.project.updatedAt),
    });
  }

  async findById(id: string): Promise<ProjectDTO | null> {
    return this.inMemoryProjects.get(id) || null;
  }

  async findAll(): Promise<ProjectDTO[]> {
    return Array.from(this.inMemoryProjects.values());
  }

  async create(project: ProjectDTO): Promise<ProjectDTO> {
    this.inMemoryProjects.set(project.id, project);
    return project;
  }

  async update(id: string, partial: Partial<ProjectDTO>): Promise<ProjectDTO | null> {
    const existing = this.inMemoryProjects.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...partial, updatedAt: new Date() };
    this.inMemoryProjects.set(id, updated);
    return updated;
  }
}
