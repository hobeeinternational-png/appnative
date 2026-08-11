export type AddressParts = {
  line1: string;
  line2: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string;
  postal_code: string;
};

export function formatShippingAddress(address: AddressParts) {
  return [address.line1, address.line2, address.subdistrict, address.district, address.province, address.postal_code]
    .filter(Boolean)
    .join(" · ");
}
