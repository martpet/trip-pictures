const paths = ['/login/:provider', '/area', '/:bboxHash'] as const;

export const appPaths = Object.fromEntries(paths.map((path) => [path, path])) as {
  [key in (typeof paths)[number]]: string;
};
