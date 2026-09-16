import { ProjectDTO } from '@sitesync/types';
import { CreateProjectInput, validateCreateProject } from '@sitesync/validation';
import { ProjectRepository } from './project.repository';
import { generateId } from '@sitesync/utils';

export class ProjectService {
  constructor(private readonly projectRepo: ProjectRepository = new ProjectRepository()) {}

  async getProjectById(id: string): Promise<ProjectDTO | null> {
    return this.projectRepo.findById(id);
  }

  async getAllProjects(): Promise<ProjectDTO[]> {
    return this.projectRepo.findAll();
  }

  async createProject(input: unknown): Promise<{ success: boolean; data?: ProjectDTO; errors?: string[] }> {
    const validation = validateCreateProject(input);
    if (!validation.valid || !validation.data) {
      return { success: false, errors: validation.errors };
    }

    const { name, code, description, location, startDate, plannedEndDate } = validation.data;

    const newProject: ProjectDTO = {
      id: generateId('PROJ'),
      name,
      code,
      description: description || '',
      status: 'ACTIVE',
      startDate: new Date(startDate),
      plannedEndDate: new Date(plannedEndDate),
      actualEndDate: null,
      plannedProgress: 0,
      actualProgress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.projectRepo.create(newProject);
    return { success: true, data: saved };
  }
}
