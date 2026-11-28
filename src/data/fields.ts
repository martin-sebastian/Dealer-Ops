export type FieldModule = "sales" | "service" | "customer"

export type FieldKind = "text" | "image"

export type CatalogField = {
  id: string
  module: FieldModule
  table: string
  column: string
  label: string
  kind: FieldKind
  sample: string
}

/**
 * Fields offered in the designer pane. Groups map 1:1 to a module table.
 * No joins — each field is a single column from sales, service, or customer.
 */
export const FIELD_CATALOG: CatalogField[] = [
  {
    id: "sales.stocknumber",
    module: "sales",
    table: "mu",
    column: "stocknumber",
    label: "Stock number",
    kind: "text",
    sample: "HD24668U",
  },
  {
    id: "sales.year",
    module: "sales",
    table: "mu",
    column: "year",
    label: "Year",
    kind: "text",
    sample: "2024",
  },
  {
    id: "sales.mfg",
    module: "sales",
    table: "mu",
    column: "mfg",
    label: "Make",
    kind: "text",
    sample: "Harley-Davidson",
  },
  {
    id: "sales.modelname",
    module: "sales",
    table: "mu",
    column: "modelname",
    label: "Model",
    kind: "text",
    sample: "Nightster Special",
  },
  {
    id: "sales.color",
    module: "sales",
    table: "mu",
    column: "color",
    label: "Color",
    kind: "text",
    sample: "Black",
  },
  {
    id: "sales.vin",
    module: "sales",
    table: "mu",
    column: "vin",
    label: "VIN",
    kind: "text",
    sample: "1HD1YCZ10RB123456",
  },
  {
    id: "sales.msrp",
    module: "sales",
    table: "mu",
    column: "msrp",
    label: "MSRP",
    kind: "text",
    sample: "$12,499",
  },
  {
    id: "sales.saleprice",
    module: "sales",
    table: "mu",
    column: "saleprice",
    label: "Sale price",
    kind: "text",
    sample: "$11,499",
  },
  {
    id: "sales.webtitle",
    module: "sales",
    table: "mu",
    column: "webtitle",
    label: "Web title",
    kind: "text",
    sample: "2024 Harley-Davidson Nightster Special",
  },
  {
    id: "sales.b50imageurl",
    module: "sales",
    table: "mu",
    column: "b50imageurl",
    label: "Unit photo (CDN)",
    kind: "image",
    sample: "https://picsum.photos/seed/dealer-ops-unit/800/600",
  },
  {
    id: "service.ext_id",
    module: "service",
    table: "ro",
    column: "ext_id",
    label: "RO number",
    kind: "text",
    sample: "RO-10482",
  },
  {
    id: "service.status",
    module: "service",
    table: "ro",
    column: "status",
    label: "RO status",
    kind: "text",
    sample: "In service",
  },
  {
    id: "service.customer_name",
    module: "service",
    table: "ro",
    column: "customer_name",
    label: "RO customer",
    kind: "text",
    sample: "Alex Rivera",
  },
  {
    id: "service.vehicle_year",
    module: "service",
    table: "ro",
    column: "vehicle_year",
    label: "RO year",
    kind: "text",
    sample: "2022",
  },
  {
    id: "service.vehicle_make",
    module: "service",
    table: "ro",
    column: "vehicle_make",
    label: "RO make",
    kind: "text",
    sample: "Honda",
  },
  {
    id: "service.vehicle_model",
    module: "service",
    table: "ro",
    column: "vehicle_model",
    label: "RO model",
    kind: "text",
    sample: "Rebel 500",
  },
  {
    id: "service.total_amount",
    module: "service",
    table: "ro",
    column: "total_amount",
    label: "RO total",
    kind: "text",
    sample: "$428.16",
  },
  {
    id: "service.technician_name",
    module: "service",
    table: "ro",
    column: "technician_name",
    label: "Technician",
    kind: "text",
    sample: "Jordan Lee",
  },
  {
    id: "customer.customer_name",
    module: "customer",
    table: "customer",
    column: "customer_name",
    label: "Customer name",
    kind: "text",
    sample: "Alex Rivera",
  },
  {
    id: "customer.company_name",
    module: "customer",
    table: "customer",
    column: "company_name",
    label: "Company",
    kind: "text",
    sample: "Rivera Transport",
  },
  {
    id: "customer.email",
    module: "customer",
    table: "customer",
    column: "email",
    label: "Email",
    kind: "text",
    sample: "alex@example.com",
  },
  {
    id: "customer.phone",
    module: "customer",
    table: "customer",
    column: "phone",
    label: "Phone",
    kind: "text",
    sample: "(317) 555-0142",
  },
  {
    id: "customer.city",
    module: "customer",
    table: "customer",
    column: "city",
    label: "City",
    kind: "text",
    sample: "Indianapolis",
  },
  {
    id: "customer.state",
    module: "customer",
    table: "customer",
    column: "state",
    label: "State",
    kind: "text",
    sample: "IN",
  },
  {
    id: "customer.zip",
    module: "customer",
    table: "customer",
    column: "zip",
    label: "ZIP",
    kind: "text",
    sample: "46204",
  },
]

export const MODULE_LABELS: Record<FieldModule, string> = {
  sales: "Sales",
  service: "Service",
  customer: "Customer",
}

/** Finds a catalog field by id. */
export function getField(id: string) {
  return FIELD_CATALOG.find((field) => field.id === id)
}

/** Groups catalog fields by module for the left pane. */
export function fieldsByModule() {
  return {
    sales: FIELD_CATALOG.filter((field) => field.module === "sales"),
    service: FIELD_CATALOG.filter((field) => field.module === "service"),
    customer: FIELD_CATALOG.filter((field) => field.module === "customer"),
  }
}
