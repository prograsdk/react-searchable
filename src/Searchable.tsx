import debounce from 'lodash.debounce';
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
 * const predicate: IFilteringPredicate<User> = (user, value) =>
 *   user.name.includes(value) || user.email.includes(value);
 * ```
 *
 * @typeparam T - The type of items that will be filtered using the predicate.
 * @param item - The current item in the filtering process.
 * @param value - A search value used for filtering.
 */
export interface IFilteringPredicate<T> {
  (item: T, value: string): boolean;
}

export interface IRenderProp<T> {
  (props: {
    items: T[];
    value: string;
    handleChange(event: ChangeEvent<HTMLInputElement>): void;
  }): ReactNode;
}

interface IBaseProps<T> {
  /**
   * Should the filtering function be debounced?
   */
  debounce: boolean;
  /**
   * The amount in ms to debounce the filtering method.
   */
  debounceDuration: number;
  /**
   * An initial search value. Will affect initial state.
   */
  initialValue: string;
  /**
   * The array of items to filter.
   */
  items: T[];
  /**
   * The predicate used for filtering items.
   */
  predicate: IFilteringPredicate<T>;
  children: IRenderProp<T>;
  render: IRenderProp<T>;
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
   * Current value used for filtering.
   */
  value: string;
}

/**
 * @typeparam T - The type of items to search.
 */
export default class Searchable<T> extends Component<IProps<T>, IState<T>> {
  public static defaultProps = {
    debounce: true,
    debounceDuration: 100,
    initialValue: '',
  };

  /**
   * Filters an array of items based on a search value and a filtering predicate.
   *
   * @typeparam T - The type of items.
   * @param items - The array of items to be filtered.
   * @param value - A search string to be passed to the predicate.
   * @param predicate - A filtering predicate based on an item and the search value.
   * @returns A filtered array of items.
   */
  public static filter<T>(items: T[], value: string, predicate: IFilteringPredicate<T>) {
    return items.filter((item: T) => predicate(item, value));
  }

  constructor(props: IProps<T>) {
    super(props);

    const { initialValue: value, predicate, items, debounce: shouldDebounce } = props;

    this.state = {
      items: value !== '' ? Searchable.filter<T>(items, value, predicate) : items,
      value,
    };

    if (shouldDebounce) {
      this.filterAndSetState = debounce(this.filterAndSetState, this.props.debounceDuration);
    }
  }

  /**
   * Change event handler for updating value in state.
   *
   * @param event - An instance of ChangeEvent
   */
  public handleChange = (event: ChangeEvent<HTMLInputElement>): void =>
    this.setState({value: event.target.value})

  /**
   * Call filtering method if [[IState.value]] has changed.
   */
  public componentDidUpdate(prevProps: IProps<T>, prevState: IState<T>): void {
    const {value} = this.state;

    if (value !== prevState.value) {
      const {items} = this.props;

      this.filterAndSetState(items, value);
    }
  }

  public render(): ReactNode {
    const {items, value} = this.state;
    const {render, children} = this.props;

    const renderParams = { items, value, handleChange: this.handleChange };

    if (render) {
      return render(renderParams);
    } else if (children) {
      return children(renderParams);
    } else {
      return null;
    }
  }

  /**
   * Filters an array of items and sets state. This method might be debounced in [[constructor]].
   *
   * @param items - The array of items to filter.
   * @param value - The search value to base the filtering on.
   */
  public filterAndSetState(items: T[], value: string): void {
    const { predicate } = this.props;

    this.setState({
      items: value !== '' ? Searchable.filter<T>(items, value, predicate) : items,
    });
  }
}
