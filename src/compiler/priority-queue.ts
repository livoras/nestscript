/** Small stable priority queue used by the source-to-bytecode compiler. */
export class CategoriesPriorityQueue<T = any> {
  public categories: { [x: number]: T[] } = {}

  public push(item: T, priority: number = 100): void {
    const list = this.categories[priority] || []
    list.push(item)
    this.categories[priority] = list
  }

  public clear(): void {
    this.categories = {}
  }

  *[Symbol.iterator](): IterableIterator<T> {
    const lists = Object.keys(this.categories)
      .sort((left, right): number => Number(left) - Number(right))
      .map((key): T[] => this.categories[Number(key)])
    for (const list of lists) {
      for (const item of list) {
        yield item
      }
    }
  }
}
