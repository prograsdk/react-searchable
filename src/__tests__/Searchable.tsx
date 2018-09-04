import debounce from 'lodash.debounce';
import {mount, ShallowWrapper, shallow} from 'enzyme';
import React from 'react';
import Searchable, {IProps} from '../Searchable';

jest.mock('lodash.debounce', (): any => jest.fn((fn: () => any) => fn));

interface IUser {
  name: string;
}

interface ISetup<T> {
  wrapper: ShallowWrapper;
  props: IProps<T>;
}

function setup(overrides?: any): ISetup<IUser> {
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

  const wrapper: ShallowWrapper = shallow<Searchable<IUser>, {}, {}>(
    <Searchable<IUser> {...props}>{() => null}</Searchable>,
  );

  return {
    props,
    wrapper,
  };
}

describe('<Searchable />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const {wrapper} = setup();

    expect(wrapper).toMatchSnapshot();
  });

  it('debounces filtering function', () => {
    const {wrapper} = setup();
    const instance = wrapper.instance() as Searchable<IUser>;

    const filter = instance.filterAndSetState;

    expect(debounce).toHaveBeenCalledWith(filter, 100);
  });

  it('does not debounce the function', () => {
    const {wrapper} = setup({debounce: false});

    expect(debounce).not.toHaveBeenCalled();
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

  it('returns items prop if value is empty string', () => {
    const {wrapper, props: { items }} = setup();

    wrapper.setState({value: ''});

    expect(wrapper.state('items')).toEqual(items);
  });

  it('filters items based on predicate', () => {
    const {wrapper} = setup();

    wrapper.setState({value: 'Jake'});

    expect(wrapper.state('items')).toEqual([{name: 'Jake Bullock'}]);
  });

  it('does not call Searchable.filter if value is empty', () => {
    const {wrapper} = setup();

    // Mock Searchable.filter
    const filter = jest.fn();
    Searchable.filter = filter;

    wrapper.setState({ value: '' });

    expect(filter).not.toHaveBeenCalled();
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

  it('renders render prop if passed', () => {
    const {props} = setup();

    const render = () => <p>react-searchable</p>;

    const wrapper = mount(
      <Searchable<IUser> {...props} render={render} />,
    );

    expect(wrapper.find('p').exists()).toBe(true);
  });
});
