function parseStoredCompanies(raw: string | null): any[] {
  if (!raw || raw === 'null' || raw === '""' || raw === "''") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((c) => c && c._id) : [];
  } catch {
    return [];
  }
}

/** True only when the signed-in account is a B2B user with at least one company. */
export function userHasB2BAccess() {
  if (typeof window === 'undefined') return false;
  if (window.localStorage.getItem('isB2b') !== 'true') return false;
  const companies = parseStoredCompanies(window.localStorage.getItem('b2bUserDetails'));
  return companies.length > 0;
}

export function GetCompaniesData(b2bUserDetails?: any) {
  const selectedB2BCompany =
    typeof window !== 'undefined' && localStorage.getItem('selectedB2BCompany');
  let b2buserdata = b2bUserDetails
    ? b2bUserDetails
    : parseStoredCompanies(
        typeof window !== 'undefined' ? localStorage.getItem('b2bUserDetails') : null
      );
  const AllB2bAllowedCompanies = Array.isArray(b2buserdata) ? [...b2buserdata] : [];

  if (selectedB2BCompany && Array.isArray(b2buserdata) && b2buserdata.length > 0) {
    b2buserdata = b2buserdata.find((j: any) => j._id == selectedB2BCompany);
  }

  return {
    b2buserdata,
    AllB2bAllowedCompanies: Array.isArray(AllB2bAllowedCompanies) ? AllB2bAllowedCompanies : [],
    selectedB2BCompany,
  };
}

export async function updateUserDetails(_opts?: unknown) {
  const { refreshUserDetailsFromApi } = await import('@/services/authService');
  return refreshUserDetailsFromApi();
}
