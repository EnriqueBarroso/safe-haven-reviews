// ── Tipos compartidos para el sistema de hilos ──

export type TreeNode = {
  id: string
  parent_id: string | null
  alias: string
  avatar_url: string | null
  details: string | null
  created_at: string
  veracity?: number | null
  punctuality?: number | null
  communication?: number | null
  hygiene?: number | null
  overall?: number | null
  price?: number | null
  duration?: number | null
  type?: string
  review_images?: any[]
  children: TreeNode[]
}

export type TableType = "reviews" | "questions"

// ── Construir árbol a partir de lista plana ──

export function buildTree(items: any[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  items.forEach((item) => map.set(item.id, { ...item, children: [] }))

  items.forEach((item) => {
    const node = map.get(item.id)!
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortChildren = (nodes: TreeNode[]) => {
    nodes.forEach((n) => {
      n.children.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      sortChildren(n.children)
    })
  }
  sortChildren(roots)

  return roots
}