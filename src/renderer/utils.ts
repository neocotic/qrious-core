import Frame from 'src/Frame';

export const getModuleSize = (frame: Frame, padding: number, size: number): number => {
  const pixels = Math.floor((size - (padding * 2)) / frame.width);

  return Math.max(1, pixels);
};
