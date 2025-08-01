export const toCamelCase = (str) =>
  str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|_+)/g, (word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .replace(/_/g, '');

export const toSnakeCase = (str) =>
  str.replace(/([A-Z])/g, '_$1').toLowerCase();
