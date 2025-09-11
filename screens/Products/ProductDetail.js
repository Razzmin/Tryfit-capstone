import { useRoute, useNavigation } from '@react-navigation/native';
import { useState, useContext, useEffect } from 'react';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Text,
  TextInput,
  Keyboard,
  Modal,
  ScrollView,
  Image,
  Alert,
} from 'react-native';


import { NotificationContent } from '../../content/notificationcontent';
import { CartContext } from '../../content/shoppingcartcontent';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import {
  PageScroll,
  ImageSlider,
  ProductImage,
  Content,
  ProductName,
  ProductPrice,
  ColorRow,
  ColorCircle,
  RatingText,
  SectionTitle,
  RightHeartIcon,
  ColorWrapper,
  NavBar,
  AddCartBtn,
  AddCartText,
  SliderIndicatorWrapper,
  Dash,
  ReviewContainer,
  ReviewItems,
  ReviewContent,
  Avatar,
  AvatarText,
  VariationText,
  StarRatings,
  CommentText,
  ReviewerName,
  Header,
  ProductContainer,
  BackBtnPro,
} from '../../components/styles';

import AntDesign from '@expo/vector-icons/AntDesign'
import FontAwesome from '@expo/vector-icons/FontAwesome';

const db = getFirestore();
const auth = getAuth();
const avatarColors = ['#D98EFF', '#BDBDBD', '#FFB6C1', '#90CAF9', '#FFF59D', '#EF9A9A', '#CE93D8'];

export default function ProductDetail() {
  const route = useRoute(); 
  const product = route.params?.product;
  const navigation = useNavigation();
  const user = auth.currentUser;

  const images = product.images || [product.imageUrl];
  const colors = product.colors || []; 
  

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSelectedColor, setModalSelectedColor] = useState(colors[0] || null);
  const [modalQuantity, setModalQuantity] = useState(1); 
  const [selectedSize, setSelectedSize] = useState(null);


  const { addNotification } = useContext(NotificationContent);
  const { addToCart } = useContext(CartContext);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [visibleMenuId, setVisibleMenuId] = useState(null);

  const reviewsRef = collection(db, 'productReviews');
  const cartRef = collection(db, 'cartItems');
  const colorMap = {
        Black: '#000000',
        White: '#FFFFFF',
        Red: '#FF0000',
        Yellow: '#FFFF00',
        Blue: '#0000FF', 
      };

  useEffect(() => {
    const q = query(
      reviewsRef,
      where('productId', '==', product.id),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setReviews(list);
    });

    return () => unsubscribe();
  }, [product.id]);

  const toggleMenu = (id) => {
    setVisibleMenuId((prev) => (prev === id ? null : id));
  };

  const deleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'productReviews', commentId));
      setVisibleMenuId(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const postComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !user) return;

    let displayName = user.displayName || user.email?.split('@')[0] || 'Anonymous';

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        displayName = data.displayName || displayName;
      }
    } catch {
      
    }

    const newReview = {
      userId: user.uid,
      userName: displayName,
      productId: product.id,
      variation: selectedColor,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: trimmed,
      timestamp: serverTimestamp(),
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };

    setNewComment('');

    try {
      await addDoc(reviewsRef, newReview);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // --- helper to safely get stock ---
  const safeStock = product?.stock || {};

  // check total stock for a color
  const getColorStock = (color) => {
    const sizes = safeStock[color] || {};
    return Object.values(sizes).reduce((sum, qty) => sum + qty, 0);
  };

  // get stock for specific color + size
  const getSizeStock = (color, size) => {
    return safeStock[color]?.[size] ?? 0;
  };


  const saveCartItem = async () => {
  if (!user) {
    Alert.alert('Error', 'You must be logged in to add to cart.');
    return;
  }
  if (!modalSelectedColor || !selectedSize) {
    Alert.alert('Error', 'Please select color and size.');
    return;
  }

  const stockAvailable = getSizeStock(modalSelectedColor, selectedSize);
  if (modalQuantity > stockAvailable) {
    Alert.alert('Error', `Only ${stockAvailable} item(s) available for this option.`);
    return;
  }

  // ✅ Generate Firestore-style unique cart item ID
  const cartItemCode = doc(collection(db, "tmp")).id;

  const cartItem = {
    cartItemCode,       // unique identifier for this cart item
    userId: user.uid,
    productId: product.id,
    productName: product.name,
    productImage: product.imageUrl,
    color: modalSelectedColor,
    size: selectedSize,
    quantity: modalQuantity,
    price: product.price,
    timestamp: serverTimestamp(),
  };

  try {
    // ✅ Use setDoc to assign our own ID
    await setDoc(doc(cartRef, cartItemCode), cartItem);

    addNotification(`${product.name} added to cart`);
    Alert.alert("Success", "Item is added to your cart");

    setModalVisible(false);
    setModalQuantity(1);
    setSelectedSize(null);
  } catch (error) {
    Alert.alert('Error', 'Failed to add item to cart.');
    console.error('Add to cart error:', error);
  }
};



  
  const incrementQuantity = () => {
  const stockAvailable = selectedSize
    ? getSizeStock(modalSelectedColor, selectedSize)
    : getColorStock(modalSelectedColor);

  if (modalQuantity < stockAvailable) {
    setModalQuantity(modalQuantity + 1);
  }
};

const decrementQuantity = () => {
  if (modalQuantity > 1) {
    setModalQuantity(modalQuantity - 1);
  }
};



  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          if (visibleMenuId !== null) {
            setVisibleMenuId(null);
          } else {
            Keyboard.dismiss();
          }
        }}
      >
        <ProductContainer>
          <PageScroll contentContainerStyle={{  flexGrow: 1, paddingBottom: 150 }}>
            <Header>
              <BackBtnPro onPress={() => navigation.goBack()}>
                <FontAwesome name="arrow-left" size={24} color="black" />
              </BackBtnPro>
            </Header>

            <ImageSlider
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const slide = Math.round(
                  e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
                );
                setActiveImage(slide);
              }}
              scrollEventThrottle={16}
            >
              {images.map((img, index) => (
                <TouchableOpacity key={index} onPress={() => setActiveImage(index)}>
                  <ProductImage source={{ uri: img }} />
                </TouchableOpacity>
              ))}
            </ImageSlider>

            <SliderIndicatorWrapper>
              {images.map((_, index) => (
                <Dash key={index} $active={activeImage === index} />
              ))}
            </SliderIndicatorWrapper>

            <Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ProductName>{product.name}</ProductName>
                <RightHeartIcon TouchableOpacity onPress={() => console.log('Heart')}>
                  <AntDesign name="hearto" size={20} color="black" />
                </RightHeartIcon>
              </View>

              <ProductPrice>{product.price}</ProductPrice>
              <RatingText> ★★★★☆ {product.rating} | {product.sold} Sold </RatingText>

              <ColorWrapper>
                <RatingText>Color Variation</RatingText>
                <ColorRow>
                  {colors.map((color, i) => (
                    <ColorCircle
                      key={i}
                      style={{
                        backgroundColor: colorMap[color] || '#ccc', // fallback if color not in map
                        borderColor: selectedColor === color ? '#9747FF' : '#ccc',
                        borderWidth: selectedColor === color ? 2 : 1,
                      }}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </ColorRow>
              </ColorWrapper>


              <SectionTitle>Product Details</SectionTitle>
              {product.description?.split('\n').map((line, index) => (
                <Text key={index}>• {line.trim()}</Text>
              ))}

              <SectionTitle>Reviews</SectionTitle>
              <ReviewContainer>
                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((item) => (
                  <ReviewItems key={item.id} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Avatar style={{ backgroundColor: item.avatarColor || '#9747FF' }}>
                      <AvatarText>{item.userName?.[0]?.toUpperCase() || 'A'}</AvatarText>
                    </Avatar>

                    <ReviewContent style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <ReviewerName>{item.userName}</ReviewerName>

                        {user?.uid === item.userId && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                            {visibleMenuId === item.id && (
                              <TouchableOpacity
                                onPress={() => deleteComment(item.id)}
                                style={{
                                  marginRight: 10,
                                  backgroundColor: '#E0E0E0',
                                  paddingHorizontal: 12,
                                  borderRadius: 6,
                                  zIndex: 999,
                                }}
                              >
                                <Text style={{ color: 'black', fontWeight: 'bold' }}>Delete</Text>
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity onPress={() => toggleMenu(item.id)}>
                              <AntDesign name="ellipsis1" size={18} color="#333" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      <VariationText>Color: {item.variation}</VariationText>
                      <StarRatings>
                        {[...Array(5)].map((_, i) => (
                          <AntDesign
                            key={i}
                            name={i < item.rating ? 'star' : 'staro'}
                            size={14}
                            color="#F7C700"
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </StarRatings>
                      <CommentText>{item.comment}</CommentText>
                    </ReviewContent>
                  </ReviewItems>
                ))}

                {reviews.length > 3 && (
                  <TouchableOpacity
                    onPress={() => setShowAllReviews(!showAllReviews)}
                    style={{ marginTop: 10, alignSelf: 'center' }}
                  >
                    <Text style={{ color: '#9747FF', fontWeight: '600' }}>
                      {showAllReviews ? 'Hide Reviews' : 'Show More Reviews'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ReviewContainer>

              
            </Content>
          </PageScroll>

          <NavBar>
            <AddCartBtn onPress={() => setModalVisible(true)}>
              <AddCartText>Add to Cart</AddCartText>
            </AddCartBtn>

            <AddCartBtn onPress={() => console.log('Try on')}>
              <AddCartText>Try-on</AddCartText>
            </AddCartBtn>
          </NavBar>
        </ProductContainer>
      </TouchableWithoutFeedback>

      {/* Modal for Add to Cart */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  width: '100%',
                  maxWidth: 400,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}
              >
                {/* Left: Small Product Image */}
                <Image
                  source={{ uri: product.imageUrl }}
                  style={{ width: 80, height: 80, borderRadius: 8, marginRight: 16 }}
                  resizeMode="contain"
                />

                {/* Right: Details */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                    {product.name}
                  </Text>

                  {/* Color selection */}
                    <View style={{ marginBottom: 10 }}>
                      <Text style={{ marginBottom: 6 }}>Choose Color:</Text>
                      {Object.keys(safeStock).map((color) => {
                        const totalStock = getColorStock(color);

                        return (
                          <TouchableOpacity
                            key={color}
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                            onPress={() => {
                              setModalSelectedColor(color);
                              setModalQuantity(1);
                            }}
                          >
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: modalSelectedColor === color ? '#9747FF' : '#ccc',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8,
                              }}
                            >
                              {modalSelectedColor === color && (
                                <View
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#9747FF',
                                  }}
                                />
                              )}
                            </View>
                            <Text style={{ fontSize: 16 }}> {color} </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {/* Size selection */}
                    {modalSelectedColor && (
                      <View style={{ marginBottom: 10 }}>
                        <Text style={{ marginBottom: 6 }}>Choose Size:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {Object.entries(safeStock[modalSelectedColor] || {}).map(([size, qty]) => (
                            <TouchableOpacity
                              key={size}
                              disabled={qty === 0}
                              onPress={() => {
                                setSelectedSize(size);
                                setModalQuantity(1);
                              }}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: selectedSize === size ? '#9747FF' : '#ccc',
                                backgroundColor: qty === 0 ? '#f2f2f2' : '#fff',
                                marginRight: 8,
                                marginBottom: 8,
                                opacity: qty === 0 ? 0.5 : 1,
                              }}
                            >
                              <Text style={{ fontSize: 16 }}> {size}  </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )} 

                  {/* Stock, Quantity, and Price + Add Button Row */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ marginBottom: 6, fontWeight: "600" }}>Quantity</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {/* Decrement Button */}
                      <TouchableOpacity
                        onPress={decrementQuantity}
                        disabled={modalQuantity <= 1}
                        style={{
                          backgroundColor: modalQuantity <= 1 ? "#ddd" : "#9747FF",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 4,
                          marginLeft: 6,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 18 }}>−</Text>
                      </TouchableOpacity>

                      {/* Quantity Display */}
                      <Text style={{ fontSize: 16, fontWeight: "bold", minWidth: 40, textAlign: "center" }}>
                        {modalQuantity}
                      </Text>

                      {/* Increment Button */}
                      <TouchableOpacity
                        onPress={incrementQuantity}
                        disabled={modalQuantity >= getSizeStock(modalSelectedColor, selectedSize)}
                        style={{
                          backgroundColor:
                            modalQuantity >= getSizeStock(modalSelectedColor, selectedSize) ? "#ddd" : "#9747FF",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          marginLeft: 6,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 18 }}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Stock and Price + Add Button */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text>
                        Stock:{" "}
                        {selectedSize
                          ? getSizeStock(modalSelectedColor, selectedSize)
                          : getColorStock(modalSelectedColor)}
                      </Text>
                      <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                        Price: ₱{(product.price * modalQuantity).toLocaleString()}
                      </Text>
                    </View>

                    <AddCartBtn
                      onPress={saveCartItem}
                      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                    >
                      <AddCartText>Add to Cart</AddCartText>
                    </AddCartBtn>
                  </View>

                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
