import { ConditionalKeys, EmptyObject, Replace, Split, TupleToUnion } from 'type-fest';

export type PathParams<
  Path extends `/${string}`,
  ParamLead extends string = ':',
  R extends {} = Record<
    Replace<
      ConditionalKeys<
        {
          [part in TupleToUnion<Split<Path, '/'>>]: Split<part, ParamLead>[1];
        },
        string
      >,
      ParamLead,
      ''
    >,
    string
  >
> = R extends EmptyObject ? never : R;
