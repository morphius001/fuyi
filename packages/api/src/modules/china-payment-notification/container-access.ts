export type ContainerLike = {
  resolve?: (key: string) => unknown;
  [key: string]: unknown;
};

export const resolveContainerKey = (
  container: ContainerLike | undefined,
  key: string,
): unknown => {
  if (!container) {
    return undefined;
  }

  let resolveFn: ((key: string) => unknown) | undefined;

  try {
    resolveFn =
      typeof container.resolve === "function"
        ? container.resolve.bind(container)
        : undefined;
  } catch {}

  if (resolveFn) {
    try {
      return resolveFn(key);
    } catch {}
  }

  try {
    const value = container[key];
    if (value !== undefined) {
      return value;
    }
  } catch {}

  try {
    return Reflect.get(container as object, key);
  } catch {
    return undefined;
  }
};

export const resolveFirstContainerKey = (
  container: ContainerLike | undefined,
  keys: readonly string[],
): unknown => {
  for (const key of keys) {
    const value = resolveContainerKey(container, key);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};
