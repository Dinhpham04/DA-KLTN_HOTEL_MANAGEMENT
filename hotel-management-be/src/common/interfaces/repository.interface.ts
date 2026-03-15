/**
 * Generic Repository interfaces following Interface Segregation Principle.
 * Split into Reader / Writer / Full repository.
 */

export interface IFindOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginated<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Read-only repository operations */
export interface IReadRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(options?: IFindOptions): Promise<IPaginated<T>>;
}

/** Write-only repository operations */
export interface IWriteRepository<T, TCreate, TUpdate> {
  create(data: TCreate): Promise<T>;
  update(id: number, data: TUpdate): Promise<T>;
  delete(id: number): Promise<void>;
}

/** Full CRUD repository = Reader + Writer */
export interface IRepository<T, TCreate, TUpdate>
  extends IReadRepository<T>,
  IWriteRepository<T, TCreate, TUpdate> { }
