import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface Address {
  attention?: string
  country?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  fax?: string
}

interface Props {
  type: "billing" | "shipping"
  address: Address
  onChange: (field: keyof Address, value: string) => void
}

export function AddressFields({ type, address, onChange }: Props) {
  return (
    <div className="space-y-3 border p-4 rounded-md">
      <h3 className="text-md font-semibold">
        {type === "billing" ? "Billing Address" : "Shipping Address"}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Attention</Label>
          <Input
            value={address.attention || ""}
            onChange={(e) => onChange("attention", e.target.value)}
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            value={address.country || ""}
            onChange={(e) => onChange("country", e.target.value)}
          />
        </div>
        <div>
          <Label>Address 1</Label>
          <Input
            value={address.address1 || ""}
            onChange={(e) => onChange("address1", e.target.value)}
          />
        </div>
        <div>
          <Label>Address 2</Label>
          <Input
            value={address.address2 || ""}
            onChange={(e) => onChange("address2", e.target.value)}
          />
        </div>
        <div>
          <Label>City</Label>
          <Input
            value={address.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div>
          <Label>State</Label>
          <Input
            value={address.state || ""}
            onChange={(e) => onChange("state", e.target.value)}
          />
        </div>
        <div>
          <Label>Pincode</Label>
          <Input
            value={address.pincode || ""}
            onChange={(e) => onChange("pincode", e.target.value)}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={address.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>
        <div>
          <Label>Fax</Label>
          <Input
            value={address.fax || ""}
            onChange={(e) => onChange("fax", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
