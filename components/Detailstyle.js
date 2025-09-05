import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from './styles';

const windowHeight = Dimensions.get('window').height;

export default StyleSheet.create({
  backHeader: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  scrollContent: {
    paddingBottom: 200,
  },

  productContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  imageWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },

  tryOnButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: Colors.brand,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    zIndex: 2,
  },

  tryOnText: {
    color: '#fff',
    fontWeight: '600',
  },

  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#ccc',
    borderRadius: 12,
  },

  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'black',
    marginBottom: 8,
  },

  productPrice: {
    fontSize: 22,
    color: Colors.brand,
    fontWeight: '600',
    marginBottom: 8,
  },

  productMeta: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },

  reviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    marginHorizontal: 8,
    marginBottom: 25,
    minHeight: windowHeight * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
    marginBottom: 15,
  },

  noReview: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 15,
  },

  reviewItem: {
    backgroundColor: '#f7f7f7',
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
  },

  reviewText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },

  input: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginTop: 20,
    fontSize: 16,
    color: 'black',
    textAlignVertical: 'top',
    minHeight: 80,
  },

  submitButton: {
    backgroundColor: Colors.brand,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  fixedButtonsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#ddd',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  cartButton: {
    backgroundColor: Colors.brand,
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },

  checkoutButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
});
