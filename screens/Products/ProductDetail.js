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
  KeyboardAvoidingView,
  Platform,
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
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import {
  Content,
  ProductName,
  ProductPrice,
  SectionTitle,
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
} from '../../components/styles';
import Entypo from '@expo/vector-icons/Entypo';
import {AntDesign, Feather, MaterialIcons, FontAwesome} from '@expo/vector-icons';


const db = getFirestore();
const auth = getAuth();
const avatarColors = ['#D98EFF', '#BDBDBD', '#FFB6C1', '#90CAF9', '#FFF59D', '#EF9A9A', '#CE93D8'];

export default function ProductDetail() {
  const route = useRoute(); 
  const product = route.params?.product;
  const navigation = useNavigation();
  const user = auth.currentUser;

  const images = product.images || [product.imageUrl];
  const [modalVisible, setModalVisible] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1); 
  const [selectedSize, setSelectedSize] = useState(null);


  const { addNotification } = useContext(NotificationContent);
  const { addToCart } = useContext(CartContext);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [visibleMenuId, setVisibleMenuId] = useState(null);
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTryOnProcessing, setIsTryOnProcessing] = useState(false);



  const reviewsRef = collection(db, 'productReviews');
  const cartRef = collection(db, 'cartItems');
  useEffect(() => {
    if (!product?.productID) return;

    const reviewsQuery = query(
      collection(db, "productReviews"),
     where("productID", "==", product.productID),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const fetchedReviews = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        // Add avatar color for display
        const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
        return { id: docSnap.id, avatarColor, ...data };
      });
      setReviews(fetchedReviews);
    });

    return () => unsubscribe();
  }, [product?.productID]);


  useEffect(() => {
  const fetchRecommendedSize = async () => {
    if (!user) return;

    try {
      const measurementRef = doc(db, "measurements", user.uid);
      const measurementSnap = await getDoc(measurementRef);

      if (measurementSnap.exists()) {
        const data = measurementSnap.data();
        let size = null;

        if (product.categoryMain === "Top") {
          size = data.recommendation_top_size;
        } else if (product.categoryMain === "Bottom") {
          size = data.recommendation_bottom_size;
        }

        setRecommendedSize(size || "Not available");
      } else {
        setRecommendedSize("Not available");
      }
    } catch (error) {
      console.error("Error fetching recommended size:", error);
      setRecommendedSize("Not available");
    }
  };

  fetchRecommendedSize();
}, [user, product.categoryMain]);

  useEffect(() => { 
    if (modalVisible && recommendedSize && safeStock[recommendedSize] > 0) {
      setSelectedSize(recommendedSize);
    }
  }, [modalVisible, recommendedSize]);

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
  
  const safeStock = product?.stock || {};


  const getTotalStock = () => {
    return Object.values(safeStock || {}).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  };

  
  const getSizeStock = (size) => {
    return Number(safeStock?.[size]) || 0;
  };

  const sizeOrder = product.sizes || [];

 const saveCartItem = async () => {

    if (isSaving) return; // prevent double click
      setIsSaving(true);

    if (!selectedSize) {
    Alert.alert('Error', 'Please select a size.', [
      {
        text: 'OK',
        onPress: () => setIsSaving(false), // <-- reset isSaving when user presses OK
        },
      ]);
      return;
    }

    const stockAvailable = getSizeStock(selectedSize);
    if (modalQuantity > stockAvailable) {
      Alert.alert('Error', `Only ${stockAvailable} item(s) available for this size.`, [
        {
          text: 'OK',
          onPress: () => setIsSaving(false),
        },
      ]);
      return;
    }
    
    try {
      // 🔹 Get current user
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You need to be logged in to add items to the cart.');
        return;
      }

      // 🔹 Get custom userId from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        Alert.alert('Error', 'User data not found.');
        return;
      }
      const customUserId = userDocSnap.data().userId;

      // ✅ Generate Firestore-style unique cart item ID
      const cartItemCode = doc(collection(db, "cartItems")).id;

      const cartItem = {
        cartItemCode,
        userId: customUserId, // use custom userId
        productId: product.id,
        productID: product.productID, // optional
        productName: product.productName,
        imageUrl: product.imageUrl,
        size: selectedSize,
        quantity: modalQuantity,
        price: product.price,
        delivery: product.delivery,
        timestamp: serverTimestamp(),
      };

        await Promise.all([
          setDoc(doc(cartRef, cartItemCode), cartItem),
          addDoc(collection(db, "notifications"), {
            notifID: `CRT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId: customUserId,
            title: "Item Added to Cart",
            message: `${product.productName} (${selectedSize}) was added to your cart.`,
            productID: product.productID,
            productName: product.productName,
            size: selectedSize,
            timestamp: serverTimestamp(),
            read: false,
          }),
        ]);

      // 🔹 Add notification
      await addDoc(collection(db, "notifications"), {
        notifID: `CRT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: customUserId,
        title: "Item Added to Cart",
        message: `${product.productName} (${selectedSize}) was added to your cart.`,
        productID: product.productID,
        productName: product.productName,
        size: selectedSize,
        timestamp: serverTimestamp(),
        read: false,
      });

     addNotification(`${product.productName} added to cart`);
        Alert.alert(
          "Success",
          "Item has been added to your cart.",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset modal and re-enable button
                setModalVisible(false);
                setModalQuantity(1);
                setSelectedSize(null);
                setIsSaving(false); // ✅ button can be pressed again
              },
            },
          ]
        );

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
    ? getSizeStock(selectedSize)
    : getTotalStock();

  if (modalQuantity < stockAvailable) {
    setModalQuantity(modalQuantity + 1);
  }
  };

const decrementQuantity = () => {
  if (modalQuantity > 1) {
    setModalQuantity(modalQuantity - 1);
  }
};

const handleTryOn = () => {
  if (isTryOnProcessing) return; 
  setIsTryOnProcessing(true);

  if (!product?.arUrl) {
    Alert.alert("AR not available", "Sorry, this product doesn’t have an AR try-on link yet.");
    setIsTryOnProcessing(false);
    return;
  }

  navigation.navigate("TryOnWebAR", { arUrl: product.arUrl });
  setTimeout(() => setIsTryOnProcessing(false), 500); 
};



  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1}}
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 90: 0}>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flexGrow: 1, backgroundColor: '#fff', paddingBottom: 150,}}
      >

        <ProductContainer style={{ flex: 1}}>
            <Header style = {{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingBottom: 10,
              backgroundColor: '#fff',
              borderBottomWidth: 1,
              borderBottomColor: '#ddd',
            }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={27} color="black" />
              </TouchableOpacity>

               <Text style= {{ fontSize: 15, color: '#000', fontFamily:"KronaOne", textTransform: 'uppercase'}}>Cloth Details</Text>

              <TouchableOpacity onPress={() => navigation.navigate('ShoppingCart')}>
              <Feather name="shopping-bag" size={24} color="black" />
              </TouchableOpacity>
            </Header>

             <View 
            pointerEvents="box-none"
            style = {{
              width: '100%',
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -31,
            }}>
              <Image source = {{
                uri: images && images [0] ? images[0] : null }}
                style={{
                  width: '99%',
                  height: '99%',
                  resizeMode: 'contain',
                  marginTop: 40,
                }}
             />
            </View>

            <SliderIndicatorWrapper style={{
              justifyContent: 'center', marginTop: 25
            }}>
            <Dash $active={true} />
            </SliderIndicatorWrapper>

            <Content style={{ paddingHorizontal: 21}}>
                <ProductName style = {{
              textTransform: 'uppercase',
              marginTop: 13,
              marginBottom: 11,
              letterSpacing: 2,
             }}
                >{product.productName}</ProductName>
                
             <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <ProductPrice style={{ lineHeight: 40, fontSize: 32 }}>₱{product.price}</ProductPrice>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* ⭐ Loop through 5 stars */}
                {Array.from({ length: 5 }, (_, i) => (
                  <Entypo
                    key={i}
                    name={i < Math.floor(product.rating) ? 'star' : 'star-outlined'} // filled or empty
                    size={17}
                    color="#EFBF04"
                    style={{ marginRight: 2 }}
                  />
                ))}

                {/* rating + sold text */}
                <Text style={{ fontSize: 13, color: '#888', marginLeft: 5 }}>
                  {product.rating.toFixed(1)} | {product.sold} Sold
                </Text>
              </View>
                          
              <View style = {{
                height: 1.3,
                backgroundColor: '#ddd',
                marginVertical: 5,
              }}></View>
          
                <SectionTitle>Description</SectionTitle>
               <Text>{product.description || ""}</Text>


              <View
                  style={{
                    backgroundColor: '#F9F9F9',
                    padding: 10,
                    borderRadius: 8,
                    marginTop: 10,
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                    Your recommended size is:{" "}
                    <Text style={{ color: '#9747FF' }}>{recommendedSize || "Loading..."}</Text>
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
               <MaterialIcons name="reviews" size={20} color="black" style={{ paddingHorizontal: 5 }}/>
                <SectionTitle>Reviews</SectionTitle>
              </View>
              
               <ReviewContainer>
                  {(reviews.filter(r => r.comment && r.comment.trim() !== "").slice(0, showAllReviews ? reviews.length : 3)).map((item) => (
                    <ReviewItems key={item.id}>
                      <Avatar style={{ backgroundColor: item.avatarColor || "#9747FF" }}>
                        <AvatarText>{item.userName?.[0]?.toUpperCase() || "A"}</AvatarText>
                      </Avatar>

                      <ReviewContent>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <ReviewerName>{item.userName}</ReviewerName>
                          <StarRatings>
                            {[...Array(5)].map((_, i) => (
                              <FontAwesome
                                key={i}
                                name={i < item.rating ? "star" : "star-o"}
                                size={14}
                                color="#F7C700"
                                style={{ marginRight: 2 }}
                              />
                            ))}
                          </StarRatings>
                        </View>

                        <VariationText>Size: {item.size}</VariationText>
                        <CommentText>{item.comment}</CommentText>
                      </ReviewContent>
                            </ReviewItems>
                          ))}

                      {reviews.length > 3 && (
                        <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)} style={{ marginTop: 10, alignSelf: "center" }}>
                          <Text style={{ color: "#9747FF", fontWeight: "600" }}>
                            {showAllReviews ? "Hide Reviews" : "Show More Reviews"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </ReviewContainer>

                    </Content>
                  </ProductContainer>
                  </ScrollView>
                  </TouchableWithoutFeedback>
                  </KeyboardAvoidingView>

                  <NavBar>
                    <AddCartBtn onPress={() => setModalVisible(true)}>
                      <AddCartText>Add to Cart</AddCartText>
                    </AddCartBtn>

                    <AddCartBtn onPress={handleTryOn} disabled={isTryOnProcessing}>
                      <AddCartText>{isTryOnProcessing ? "Processing..." : "Try-on"}</AddCartText>
                    </AddCartBtn>


        </NavBar>

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
                  width: '95%',
                  maxWidth: 350,
                  padding: 20,
                  alignItems: 'flex-start',
                }}
              >
                {/* Left: Small Product Image */}
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                <Image
                  source={{ uri: product.imageUrl }}
                  style={{ width: 80, height: 80, borderRadius: 8, marginRight: 20 }}
                  resizeMode="contain"
                />
                {/* Right: Details */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: "KronaOne", marginBottom: 10, }}>{product.productName}</Text>
                   <Text style={{ fontSize: 16,color: '#9747FF', marginTop: 4 }}>
                        Price: ₱{(product.price * modalQuantity).toLocaleString()}
                      </Text>
                  <Text>
                        Stock:{" "}
                        {selectedSize
                          ? getSizeStock(selectedSize)
                          : getTotalStock()}
                      </Text>
                  </View>
                  </View>

                  <View style = {{
                height: 1.3,
                backgroundColor: '#ddd',
                marginVertical: 5,
              }}></View>

                  {/* Size selection */}
                    {safeStock && (
                      <View style={{ marginBottom: 10, width: '100%' }}>
                        <Text style={{ fontSize: 15, marginBottom: 10, fontWeight: '600' }}>Choose Size:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 50 }}>
                          {sizeOrder.map((size) => {
                            const qty = safeStock[size] || 0;
                            return (
                              <TouchableOpacity
                                key={size}
                                disabled={qty === 0}
                                onPress={() => {
                                  setSelectedSize(size);
                                  setModalQuantity(1);
                                }}
                                style={{
                                  paddingHorizontal: 16,
                                  paddingVertical: 10,
                                  borderRadius: 6,
                                  borderWidth: 1,
                                  borderColor: selectedSize === size ? '#9747FF' : '#ccc',
                                  backgroundColor:
                                    qty === 0
                                      ? '#f2f2f2'
                                      : recommendedSize === size
                                      ? '#F3E5F5'
                                      : '#fff',
                                  marginRight: 8,
                                  marginBottom: 8,
                                  opacity: qty === 0 ? 0.5 : 1,
                                }}
                              >
                                <Text style={{ fontSize: 16 }}>
                                  {size}
                                  {recommendedSize === size && <Text> ☑️</Text>}
                                </Text>

                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}

                  {/*Quantity*/}
                  <View style={{ width: '100%', marginBottom: 10 }}>
                    <Text style={{ fontSize: 15, marginBottom: 6, fontWeight: "600" }}>Quantity:</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
                     <Text style={{ fontSize: 12 }}></Text>
                     <View style={{ flexDirection: "row", alignItems: "center", marginRight: 80 }}>
                      {/* Decrement Button */}
                      <TouchableOpacity
                        onPress={decrementQuantity}
                        disabled={modalQuantity <= 1}
                        style={{
                          backgroundColor: modalQuantity <= 1 ? "#ddd" : "#9747FF",
                         width: 35,
                          height: 35,
                          borderRadius: 4,
                          marginLeft: 6,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 20, alignSelf: 'center'  }}>−</Text>
                      </TouchableOpacity>

                      {/* Quantity Display */}
                      <Text style={{ fontSize: 16, fontWeight: "bold", minWidth: 40, textAlign: "center" }}>
                        {modalQuantity}
                      </Text>

                      {/* Increment Button */}
                      <TouchableOpacity
                        onPress={incrementQuantity}
                        disabled={modalQuantity >= getSizeStock(selectedSize)}
                        style={{
                          backgroundColor:
                            modalQuantity >= getSizeStock(selectedSize) ? "#ddd" : "#9747FF",
                          width: 35,
                          height: 35,
                          borderRadius: 4,
                          marginLeft: 6,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 20, alignSelf: 'center' }}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
              </View>

              <View style = {{
                height: 1.3,
                backgroundColor: '#ddd',
                marginVertical: 5,
              }}></View>
              
                  {/* Add Button */}
                    <AddCartBtn
                      onPress={saveCartItem}
                      disabled={isSaving}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 20,
                        marginBottom: 5,
                        minWidth: 290,
                        opacity: isSaving ? 0.6 : 1,
                      }}
                    >
                      <AddCartText>{isSaving ? "Adding..." : "Add to Cart"}</AddCartText>
                    </AddCartBtn>

                  </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
