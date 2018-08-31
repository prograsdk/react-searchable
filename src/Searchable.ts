import {ChangeEvent, Component, ReactNode} from 'react';

type HandleChange = (event: ChangeEvent<HTMLInputElement>) => void;

interface IProps<T> {
  initialValue?: string;
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
  public state: IState<T> = {
    items: this.props.items,
    value: this.props.initialValue || '',
  };

  public handleChange: HandleChange = ({target: {value}}) =>
    this.setState({value})

  public componentDidUpdate(prevProps: IProps<T>, prevState: IState<T>): void {
    const {value} = this.state;

    if (value !== prevState.value) {
      const {items, predicate} = this.props;

      this.setState({items: items.filter((item) => predicate(item, value))});
    }
  }

  public render(): ReactNode {
    const {items, value} = this.state;

    return this.props.children({items, value, handleChange: this.handleChange});
  }
}
