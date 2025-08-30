import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, Alert} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {RootState} from '../store';
import {clearCart} from '../store/slices/cartSlice';

const PaymentScreen = () => {
  const total = useSelector((state: RootState) => state.cart.total);
  const [cash, setCash] = useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const cashAmount = parseFloat(cash) || 0;
  const change = cashAmount - total;

  const handlePayment = () => {
    if (cashAmount < total) {
      Alert.alert('Insufficient Cash', 'Please enter an amount greater than or equal to the total.');
      return;
    }
    // Mock bill printing
    Alert.alert('Payment Successful', `Change: $${change.toFixed(2)}\nBill printed.`);
    dispatch(clearCart());
    navigation.navigate('Home' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter cash amount"
        keyboardType="numeric"
        value={cash}
        onChangeText={setCash}
      />
      <Text style={styles.change}>Change: ${change.toFixed(2)}</Text>
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Pay & Print Bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  total: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 18,
    marginBottom: 20,
  },
  change: {
    fontSize: 18,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
