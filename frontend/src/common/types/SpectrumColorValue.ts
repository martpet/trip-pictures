import { ColorValueV6, SemanticColorValue } from '@react-types/shared';

export type SpectrumColorValue = Exclude<ColorValueV6, SemanticColorValue>;
