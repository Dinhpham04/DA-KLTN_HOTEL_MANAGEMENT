/**
 * Generic Use Case interface.
 * Every use case implements this with specific Input/Output types.
 *
 * @template TInput  - The input DTO type
 * @template TOutput - The output/response type
 */
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
