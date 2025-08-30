import {View, Text, StyleSheet, SectionList, TouchableOpacity} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {RootState} from '../store';
import {addItem} from '../store/slices/cartSlice';

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  isFavorite: boolean;
}

const HomeScreen = () => {
  const items = useSelector((state: RootState) => state.items.items);
  const categories = useSelector((state: RootState) => state.items.categories);
  const cartItemsCount = useSelector((state: RootState) => state.cart.items.length);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const groupedItems = categories.map(category => ({
    title: category,
    data: items.filter(item => item.category === category || (category === 'Favorite' && item.isFavorite)),
  }));

  const renderItem = ({item}: {item: Item}) => (
    <TouchableOpacity style={styles.item} onPress={() => dispatch(addItem({ id: item.id, name: item.name, price: item.price, quantity: 1, unit: item.unit }))}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>${item.price.toFixed(2)} / {item.unit}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({section: {title}}: {section: {title: string}}) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery POS Terminal</Text>
      <SectionList
        sections={groupedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        style={styles.list}
      />
      <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart' as never)}>
        <Text style={styles.cartButtonText}>View Cart ({cartItemsCount})</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#ddd',
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
