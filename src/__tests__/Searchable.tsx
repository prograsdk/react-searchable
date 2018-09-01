import {shallow, ShallowWrapper} from 'enzyme';
import * as React from 'react';
import Searchable, {IProps} from '../Searchable';

jest.mock('lodash.debounce', (): any => jest.fn((fn: () => any) => fn));

interface IUser {
  name: string;
}

interface ISetup<T> {
  wrapper: ShallowWrapper;
  props: IProps<T>;
}

function setup(overrides?): ISetup<IUser> {
  const props: IProps<IUser> = {
    items: [
      {
        name: 'Stewart Harrison',
      },
      {
        name: 'Jake Bullock',
      },
    ],
    predicate: (item: IUser, value: string): boolean =>
      item.name.includes(value),
    ...overrides,
  };

  const wrapper: ShallowWrapper = shallow(
    <Searchable {...props}>{() => <></>}</Searchable>,
  );

  return {
    props,
    wrapper,
  };
}

describe('<Searchable />', () => {
  it('renders without crashing', () => {
    const {wrapper} = setup();

    expect(wrapper).toMatchSnapshot();
  });

  it('filters initial state based on props', () => {
    const {wrapper} = setup({initialValue: 'Jake'});

    expect(wrapper.state('items')).toEqual([{name: 'Jake Bullock'}]);
  });

  it('returns empty array if no matches', () => {
    const {wrapper} = setup();

    wrapper.setState({value: 'corncob'});

    expect(wrapper.state('items')).toEqual([]);
  });

  it('filters items based on predicate', () => {
    const {wrapper} = setup();

    wrapper.setState({value: 'Jake'});

    expect(wrapper.state('items')).toEqual([{name: 'Jake Bullock'}]);
  });

  describe('handleChange', () => {
    it('sets state', () => {
      const {wrapper} = setup();
      const instance = wrapper.instance() as Searchable<IUser>;
      const event = { target: { value: 'Jake' } } as React.ChangeEvent<HTMLInputElement>;

      instance.handleChange(event);

      expect(wrapper.state('value')).toEqual('Jake');
    });
  });
});
