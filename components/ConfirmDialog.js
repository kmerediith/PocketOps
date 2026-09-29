/**
 * @file Destructive-action confirmation dialog.
 * @author Kyle Meredith
 */
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

/**
 * Modal "are you sure?" dialog with Cancel and a red confirm button.
 * @param {object} props
 * @param {boolean} props.visible
 * @param {string} props.title
 * @param {React.ReactNode} props.message Body text.
 * @param {string} [props.confirmLabel='Delete']
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onDismiss Called on Cancel or a tap outside.
 */
export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onDismiss,
}) => {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button textColor={theme.colors.error} onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
