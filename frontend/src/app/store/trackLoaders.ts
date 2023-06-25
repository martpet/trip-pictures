import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module';

export const trackLoaders = <SliceState extends { loaders: number }>(
  builder: ActionReducerMapBuilder<SliceState>,
  queries: ApiEndpointQuery<any, any>[]
) => {
  builder.addMatcher(
    (action) => queries.some((query) => query.matchPending(action)),
    (state) => {
      state.loaders++;
    }
  );

  builder.addMatcher(
    (action) =>
      queries.some(
        (query) => query.matchFulfilled(action) || query.matchRejected(action)
      ),
    (state) => {
      state.loaders--;
    }
  );
};
