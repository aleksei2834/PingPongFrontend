import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Icon } from '@/shared/ui/icons';

const meta = {
  title: 'shared/ui/button',
  component: Button,
  args: {
    children: 'Login',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'user-panel-btn',
    children: <Icon name="notification" />,
  },
};

export const IconOnly: Story = {
  args: {
    children: <Icon name="notification" />,
  },
};

export const TextWithIcon: Story = {
  args: {
    children: (
      <>
        <Icon name="notification" />
        Login
      </>
    ),
  },
};
