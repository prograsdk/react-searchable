import debounce from 'lodash.debounce';
import {ChangeEvent, Component, ReactNode} from 'react';

/** A predicate function used for filtering items */
export type FilteringPredicate<T> = (item: T, value: string) => boolean;

export interface IProps<T> {
  /** The amount in ms to debounce the filtering method */
  debounceDuration: number;
  /** An initial search value. Will affect initial state. */
  initialValue: string;
  /** The array of items to filter */
  items: T[];
  /** The predicate used for filtering items */
  predicate: FilteringPredicate<T>;
  children(params: {
    items: T[];
    value: string;
    handleChange(params: ChangeEvent<HTMLInputElement>): void;
  }): ReactNode;
}

interface IState<T> {
  /** An array of filtered items based on [[IProps.items]] */
  items: T[];
  value: string;
}

/**
 * @typeparam T - The type of items to search
 */
export default class Searchable<T> extends Component<IProps<T>, IState<T>> {
  public static defaultProps = {
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
  public static filter<T>(items: T[], value: string, predicate: FilteringPredicate<T>) {
    return items.filter((item: T) => predicate(item, value));
  }

  constructor(props: IProps<T>) {
    super(props);

    const { initialValue: value, predicate, items, debounceDuration } = props;

    this.state = {
      items: value !== '' ? Searchable.filter<T>(items, value, predicate) : items,
      value,
    };

    this.filterAndSetState = debounce(this.filterAndSetState, debounceDuration);
  }

  public filterAndSetState(items: T[], value: string): void {
    const { predicate } = this.props;

    this.setState({
      items: value !== '' ? Searchable.filter<T>(items, value, predicate) : items,
    });
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
    const {children} = this.props;

    return children({items, value, handleChange: this.handleChange});
  }
}
