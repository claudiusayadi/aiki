import { ArrayUniqueIdentifier } from 'class-validator';

export function wrapId(idOrIds: string | string[]) {
  if (Array.isArray(idOrIds)) {
    const ids = idOrIds;
    return ids.map((id) => ({ id }));
  }

  const id = idOrIds;
  return { id };
}

export const IdentifierFn = {
  ID_DTO: (id: string) => id,
} as const satisfies Record<string, ArrayUniqueIdentifier>;
