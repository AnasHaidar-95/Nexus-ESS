import { NotFoundError } from '../errors/app-error.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findMany(args = {}) {
    return this.model.findMany(args);
  }

  async findUnique(args) {
    return this.model.findUnique(args);
  }

  async findFirst(args) {
    return this.model.findFirst(args);
  }

  async create(args) {
    return this.model.create(args);
  }

  async update(args) {
    return this.model.update(args);
  }

  async delete(args) {
    return this.model.delete(args);
  }

  async count(where = {}) {
    return this.model.count({ where });
  }

  async findById(id, args = {}) {
    return this.model.findUnique({ where: { id }, ...args });
  }

  async findByIdOrThrow(id, args = {}, entityName = 'Record') {
    const item = await this.findById(id, args);
    if (!item) throw new NotFoundError(entityName);
    return item;
  }

  async findOne(where, args = {}) {
    return this.model.findFirst({ where, ...args });
  }

  async exists(where) {
    const item = await this.model.findFirst({ where, select: { id: true } });
    return !!item;
  }

  async listWithCount(where, prismaArgs = {}) {
    const [items, totalItems] = await Promise.all([
      this.model.findMany({ ...prismaArgs, where }),
      this.model.count({ where }),
    ]);
    return { items, totalItems };
  }
}
