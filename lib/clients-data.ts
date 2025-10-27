export interface Client {
  id: string
  code: string
  name: string
  email: string
  phone: string
  company: string
  totalPurchases: number
  status: "Active" | "Inactive"
}

export const clientsData: Client[] = [
  {
    id: "1",
    code: "3120",
    name: "LUIS MANUEL FLORES CORONA",
    email: "luis.flores@email.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Corp",
    totalPurchases: 15234.5,
    status: "Active",
  },
  {
    id: "2",
    code: "3121",
    name: "MARIA GARCIA LOPEZ",
    email: "maria.garcia@email.com",
    phone: "+1 (555) 234-5678",
    company: "Design Studio",
    totalPurchases: 8945.25,
    status: "Active",
  },
  {
    id: "3",
    code: "3122",
    name: "JUAN PEREZ MARTINEZ",
    email: "juan.perez@email.com",
    phone: "+1 (555) 345-6789",
    company: "Marketing Inc",
    totalPurchases: 12678.0,
    status: "Active",
  },
  {
    id: "4",
    code: "3123",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    phone: "+1 (555) 456-7890",
    company: "Startup Labs",
    totalPurchases: 5432.75,
    status: "Active",
  },
  {
    id: "5",
    code: "3124",
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    phone: "+1 (555) 567-8901",
    company: "Consulting Group",
    totalPurchases: 19876.5,
    status: "Active",
  },
  {
    id: "6",
    code: "3125",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    phone: "+1 (555) 678-9012",
    company: "E-commerce Plus",
    totalPurchases: 7654.3,
    status: "Active",
  },
  {
    id: "7",
    code: "3126",
    name: "William Kim",
    email: "will@email.com",
    phone: "+1 (555) 789-0123",
    company: "Software Solutions",
    totalPurchases: 3210.0,
    status: "Inactive",
  },
  {
    id: "8",
    code: "3127",
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    phone: "+1 (555) 890-1234",
    company: "Digital Agency",
    totalPurchases: 11234.75,
    status: "Active",
  },
]
