import debounce from 'lodash.debounce';
import {ChangeEvent, Component, ReactNode} from 'react';

type HandleChange = (event: ChangeEvent<HTMLInputElement>) => void;

type Predicate<T> = (item: T, value: string) => boolean;

export interface IProps<T> {
  debounceDuration: number;
  initialValue: string;
  items: T[];
  predicate: Predicate<T>;
  children(params: {
    items: T[];
    handleChange: HandleChange;
    value: string;
  }): ReactNode;
}

interface IState<T> {
  items: T[];
  value: string;
}

export default class Searchable<T> extends Component<IProps<T>, IState<T>> {
  public static defaultProps = {
    debounceDuration: 100,
    initialValue: '',
  };

  /**
   * Filters an array of items based on a search value and a filtering predicate.
   *
   * @param items - The array of items to be filtered.
   * @param value - A search string to be passed to the predicate.
   * @param predicate - A filtering predicate based on an item and the search value.
   * @returns A filtered array of items.
   */
  public static filter<T>(items: T[], value: string, predicate: Predicate<T>) {
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

  public handleChange: HandleChange = ({target: {value}}) =>
    this.setState({value})

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
