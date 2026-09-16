import { WBSNodeDTO, Discipline } from '@sitesync/types';
import { CreateWBSNodeInput, validateCreateWBSNode } from '@sitesync/validation';
import { generateId } from '@sitesync/utils';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export class WBSRepository {
  private inMemoryWBS = new Map<string, WBSNodeDTO>();

  constructor() {
    const synthetic = generateSyntheticProject();
    synthetic.wbsNodes.forEach(w => {
      this.inMemoryWBS.set(w.id, {
        id: w.id,
        projectId: w.projectId,
        parentId: w.parentId || null,
        code: w.code,
        name: w.name,
        level: w.level,
        path: w.path,
        discipline: w.discipline as Discipline,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async findByProjectId(projectId: string): Promise<WBSNodeDTO[]> {
    return Array.from(this.inMemoryWBS.values()).filter(w => w.projectId === projectId);
  }

  async findById(id: string): Promise<WBSNodeDTO | null> {
    return this.inMemoryWBS.get(id) || null;
  }

  async create(node: WBSNodeDTO): Promise<WBSNodeDTO> {
    this.inMemoryWBS.set(node.id, node);
    return node;
  }
}

export class WBSService {
  constructor(private readonly wbsRepo: WBSRepository = new WBSRepository()) {}

  async getWBSByProjectId(projectId: string): Promise<WBSNodeDTO[]> {
    return this.wbsRepo.findByProjectId(projectId);
  }

  async createWBSNode(input: unknown): Promise<{ success: boolean; data?: WBSNodeDTO; errors?: string[] }> {
    const validation = validateCreateWBSNode(input);
    if (!validation.valid || !validation.data) {
      return { success: false, errors: validation.errors };
    }

    const { projectId, parentId, code, name, level, discipline } = validation.data;

    let path = name;
    if (parentId) {
      const parent = await this.wbsRepo.findById(parentId);
      if (parent) {
        path = `${parent.path} > ${name}`;
      }
    }

    const node: WBSNodeDTO = {
      id: generateId('WBS'),
      projectId,
      parentId: parentId || null,
      code,
      name,
      level,
      path,
      discipline: discipline || Discipline.GENERAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.wbsRepo.create(node);
    return { success: true, data: saved };
  }
}
