import { useRoute, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text } from 'react-native';
import { useContext } from 'react';
import { NotificationContent } from '../../content/notificationcontent';
import { CartContext } from '../../content/shoppingcartcontent';

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
  BackBtn,
} from '../../components/styles';

//icons 
import AntDesign from '@expo/vector-icons/AntDesign';
import { FontAwesome } from '@expo/vector-icons';

export default function ProductDetail() {
  const route = useRoute();
  const { product, setProduct } = route.params;
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '#000');
  const { addNotification } = useContext(NotificationContent);
  const { addToCart } = useContext(CartContext);
  const navigation = useNavigation();

  
//reviews 
  const Reviews = [
    {
    id: '1',
    name: 'k**en l**g',
    rating: 5,
    variation: 'Black',
    comment: 'OK na rin...medyo d kasya sa bf ko pero cute niya tignan hehe... Thnx kay kuang driver, bilis lng mdeliver. etuc nyo po haha',
    avatarColor: '#D98EFF',
    },
    {
    id: '2',
    name: 'A***re',
    rating: 1,
    variation: 'Gray',
    comment: 'Fits me so well fr istg. Just lil’ bit tight on my biceps lol :(',
    avatarColor: '#BDBDBD',
    },
     {
    id: '3',
    name: 'ash t****o',
    rating: 3,
    variation: 'White',
    comment: 'Bruh this so good on me, fits me so well. Will buy santos next I mean...',
    avatarColor: '#FFB6C1',
  },
  {
    id: '4',
    name: 'haechan l**',
    rating: 1,
    variation: 'Violet',
    comment: 'call me old fashioned, but i was born to serve ji. i do the laundry, cook dinner, clean dishes. i live to serve & carry out every demand of her on the slightest whim, its what i was put on this earth to do. if she cheats on me then its my fault! she caught me slipping.',
    avatarColor: '#FFB6C1',
  },
  {
    id: '5',
    name: 'Elijah M*****',
    rating: 5,
    variation: 'Blue',
    comment: 'sorry eto naba yung encantadia?',
    avatarColor: '#90CAF9',
  },
  {
    id: '6',
    name: 'Ja***elyn',
    rating: 4,
    variation: 'Yellow',
    comment: 'nagustuhan ko ba? ang tamang sagot ay 🙅‍♂️ HINDI PO ATE 🖕 ',
    avatarColor: '#FFF59D',
  },
  {
    id: '7',
    name: 'Aly**an',
    rating: 5,
    variation: 'Red',
    comment: 'baka bombahin ko pa bahay nyo e btw ang ganda 10/10',
    avatarColor: '#EF9A9A',
  },
  {
     id: '8',
    name: 'Razz***',
    rating: 1,
    variation: 'Violet',
    comment: 'rue, kailan toh nangyari? like pagkatapos nang new years? *tsk tsk tsk* POTANGINAMONG BOBO KANG BITCH NA BABAE K',
    avatarColor: '#CE93D8',
  },
  ];

  return (
    <ProductContainer>
    <PageScroll contentContainerStyle={{ paddingBottom: 150}}>
    <Header>
    <BackBtnPro onPress={() => navigation.goBack()}>
   <FontAwesome name="arrow-left" size={24} color="black" />
    </BackBtnPro>
    </Header>


    <ImageSlider horizontal pagingEnabled showsHorizontalScrollIndicator={false}
      onScroll={(e) => {

    const slide = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
    );
    setActiveImage(slide)
  }}
  scrollEventThrottle={16}
  >
    {product.images.map((img, index) => (
      <TouchableOpacity key={index} onPress={() => setActiveImage(index)}>
      <ProductImage source = {{ uri: img}}/>
      </TouchableOpacity>
 ))}
    </ImageSlider>

    <SliderIndicatorWrapper>
  {product.images.map((_, index) => (
    <Dash key={index} $active={activeImage === index} />
  ))}
</SliderIndicatorWrapper>

    <Content>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  <ProductName>{product.name}</ProductName>
  <RightHeartIcon TouchableOpacity onPress={() => console.log('Heart 4 u')}>
    <AntDesign name="hearto" size={20} color="black" />
  </RightHeartIcon>
    </View>

    <ProductPrice>{product.price}</ProductPrice>
   <RatingText> ★★★★☆ {product.rating} | {product.sold} Sold </RatingText>

    <View style={{
    height: 1,
    backgroundColor: 'transparent',
    marginTop: 0,
    marginBottom: 1,
    }} 
    />


  <ColorWrapper>
  <RatingText>Color Variation</RatingText>
  <ColorRow>
    {product.colors.map((color, i) => (
    <ColorCircle
    key = {i}
    style = {{
      backgroundColor: color,
      borderColor: selectedColor === color ? '#9747FF' : '#ccc',
      borderWidth: selectedColor === color ? 2 : 1, 
    }}
      onPress={() => setSelectedColor(color)}
    />
    ))}
  </ColorRow>
</ColorWrapper>

    <SectionTitle> Product Details </SectionTitle>
    {product.description.split('\n').map((line, index) => (
  <Text key={index}>• {line.trim()}</Text>
))}

    <SectionTitle> Reviews </SectionTitle>
    <ReviewContainer>
    {Reviews.map((item) => (
      <ReviewItems key={item.id}>
      <Avatar style={{ backgroundColor: item.avatarColor}}>
      <AvatarText>{item.name[0].toUpperCase()}</AvatarText>
      </Avatar>

      <ReviewContent>
        <ReviewerName>{item.name}</ReviewerName>
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
    </ReviewContainer>
        </Content>
     </PageScroll>
    
  <NavBar>
  <AddCartBtn onPress={() => {
    console.log('Added to Cart');
    addToCart(product, selectedColor);
    addNotification(product.name);
  }}
  >
  <AddCartText>Add to Cart</AddCartText>
  </AddCartBtn>

  <AddCartBtn onPress={() => console.log('Try on')}
    >
  <AddCartText>Try-on</AddCartText>
  </AddCartBtn>
    </NavBar>
    </ProductContainer>
   );  
}  
 