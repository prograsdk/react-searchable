import debounce from 'lodash.debounce';
import {ChangeEvent, Component, ReactNode} from 'react';

type HandleChange = (event: ChangeEvent<HTMLInputElement>) => void;

export interface IProps<T> {
  debounceDuration: number;
  initialValue: string;
  items: T[];
  predicate(item: T, value: string): boolean;
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

  constructor(props: IProps<T>) {
    super(props);

    const { initialValue: value, predicate, items, debounceDuration } = props;

    this.state = {
      items: value !== '' ? this.filter(items, value) : items,
      value,
    };

    this.filterAndSetState = debounce(this.filterAndSetState, debounceDuration);
  }

  public filterAndSetState(items: T[], value: string): void {
    this.setState({
      items: value !== '' ? this.filter(items, value) : items,
    });
  }

  public filter = (items: T[], value: string): T[] => items.filter((item) => this.props.predicate(item, value));

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
