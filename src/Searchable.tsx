import lodashDebounce from 'lodash.debounce';
import {ChangeEvent, Component, ReactNode} from 'react';

/**
 * A predicate function used for filtering items.
 *
 * @example
 * ```typescript
 *
 * interface User {
 *   name: string;
 *   email: string;
 * };
 *
 * const predicate: IFilteringPredicate<User> = (user, query) =>
 *   user.name.includes(query) || user.email.includes(query);
 * ```
 *
 * @typeparam T - The type of items that will be filtered using the predicate.
 * @param item - The current item in the filtering process.
 * @param query - A search query used for filtering.
 */
export interface IFilteringPredicate<T> {
  (item: T, query: string): boolean;
}

export interface IRenderProp<T> {
  (
    props: {
      items: T[];
      query: string;
      handleChange(event: ChangeEvent<HTMLInputElement>): void;
    },
  ): ReactNode;
}

interface IBaseProps<T> {
  /**
   * The duration for debouncing the filtering function.
   */
  debounce: number | boolean;
  /**
   * An initial search query. Will affect initial state.
   */
  initialQuery: string;
  /**
   * The array of items to filter.
   */
  items: T[];
  /**
   * The predicate used for filtering items.
   */
  predicate: IFilteringPredicate<T>;
}

interface IPropsWithChildren<T> extends IBaseProps<T> {
  children: IRenderProp<T>;
}

interface IPropsWithRender<T> extends IBaseProps<T> {
  render: IRenderProp<T>;
}

export type IProps<T> = IPropsWithChildren<T> | IPropsWithRender<T>;

interface IState<T> {
  /**
   * An array of filtered items based on [[IProps.items]].
   */
  items: T[];
  /**
   * Current query used for filtering.
   */
  query: string;
}

/**
 * @typeparam T - The type of items to search.
 */
export default class Searchable<T> extends Component<IProps<T>, IState<T>> {
  public static defaultProps = {
    debounce: 300,
    initialQuery: '',
  };

  /**
   * Filters an array of items based on a search query and a filtering predicate.
   *
   * @typeparam T - The type of items.
   * @param items - The array of items to be filtered.
   * @param query - A search string to be passed to the predicate.
   * @param predicate - A filtering predicate based on an item and the search query.
   * @returns A filtered array of items.
   */
  public static filter<T>(
    items: T[],
    query: string,
    predicate: IFilteringPredicate<T>,
  ) {
    return items.filter((item: T) => predicate(item, query));
  }

  constructor(props: IProps<T>) {
    super(props);

    const {initialQuery: query, predicate, items, debounce} = props;

    this.state = {
      items:
        query !== '' ? Searchable.filter<T>(items, query, predicate) : [],
      query,
    };

    if (debounce) {
      const duration =
        typeof debounce === 'number'
          ? debounce
          : Searchable.defaultProps.debounce;
      this.filterAndSetState = lodashDebounce(this.filterAndSetState, duration);
    }
  }

  /**
   * Change event handler for updating query in state.
   *
   * @param event - An instance of ChangeEvent
   */
  public handleChange = (event: ChangeEvent<HTMLInputElement>): void =>
    this.setState({query: event.target.value})

  /**
   * Call filtering method if [[IState.query]] has changed.
   */
  public componentDidUpdate(prevProps: IProps<T>, prevState: IState<T>): void {
    const {query} = this.state;

    if (query !== prevState.query) {
      const {items} = this.props;

      this.filterAndSetState(items, query);
    }
  }

  public render(): ReactNode {
    const {items, query} = this.state;

    const renderParams = {items, query, handleChange: this.handleChange};

    if (isPropsWithRender(this.props)) {
      return this.props.render(renderParams);
    } else {
      return this.props.children(renderParams);
    }
  }

  /**
   * Filters an array of items and sets state. This method might be debounced in [[constructor]].
   *
   * @param items - The array of items to filter.
   * @param query - The search query to base the filtering on.
   */
  public filterAndSetState(items: T[], query: string): void {
    const {predicate} = this.props;

    this.setState({
      items:
        query !== '' ? Searchable.filter<T>(items, query, predicate) : [],
    });
  }
}

function isPropsWithRender<T>(props: IProps<T>): props is IPropsWithRender<T> {
  return (props as IPropsWithRender<T>).render !== undefined;
}
