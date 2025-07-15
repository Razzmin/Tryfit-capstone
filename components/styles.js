import styled from "styled-components/native";
import Constants from "expo-constants";


const StatusBarHeight = Constants.statusBarHeight;

//palette
export const Colors = {
    primary: "#EDEDED",
    secondary:"#5C427E",
    white: "#FFFFFF",
    black: "#000000",
    gray: "#717171",
    gradient: [
   "#a166ff", 
    "#a875ff",
    "#b183ff",
    "#ba92ff",
    "#c3a0ff",
    "#cdb0ff",
    "#d6bfff",
    "#e0cfff",
    "#ebdfff"
  ],
  purple: "#9747FF",
};
const {primary, secondary, white, black, gray, purple} = Colors; 

//splashscreen contents
export const SplashContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: transparent;
`;
export const SplashImage = styled.Image`
    width: 150px;
    height: 150px;
    max-width: 90%;
    max-height: 90%;
`;

//login contents
export const StyledContainer = styled.View`
    flex: 1;
    padding: 20px;
    padding-top: ${StatusBarHeight +10}px;
    background-color: transparent;
    align-items: center;
    justify-content: center;

`;
export const InnerContainer = styled.View`
    flex: 1;
    width: 90%;
    align-items:center
`;

export const PageLogo = styled.Image.attrs(() => ({
  resizeMode: "contain",
}))`
  width: 200px;
  height: 200px;
`;
export const PageTitle = styled.Text`
    font-size: 30px;
    font-weight: bold;
    color:${black};
    padding: 5px;
    margin-top: 0px;
    text-align: left;
    width: 100%;
    padding-left: 0px;
`;
export const SubTitle = styled.Text`
     font-size: 40px;
     margin-bottom: 20px;
     letter-spacing: 1px;
     font-weight: bold;
     color: ${black};
     text-align: left;
     width: 100%;
`;

export const StyledFormArea = styled.View`
    width: 110%;
    padding: 0 10px;
    margin-top: 25pxpx;
`;

export const StyledTextInput = styled.TextInput`
    background-color: ${primary};
    border-width: 1px;
    border-color: ${black};
     padding: 15px 20px;
     padding-left: 50px;
     border-radius: 10px;
     font-size: 16px;
     height: 55px;
     margin-vertical: 8px;
     margin-bottom: 10px;
     color: ${black};
     width: 100%;
`;
export const StyleInputLabel = styled.Text`
    color: ${gray};
    font-size: 15px;
    text-align: left;
`;
export const LeftIcon = styled.View`
    left: 10px;
    top: 38px;
    position: absolute;
    z-index: 1;
    
`;
export const RightIcon = styled.TouchableOpacity`
    right: 10px;
    top: 38px;
    position: absolute;
    z-index: 1;
`;
export const StyledButton = styled.TouchableOpacity`
    padding: 15px;
    background-color: ${purple};
    justify-content: center;
    border-radius: 10px;
    margin-vertical: 5px;
    height: 60px;
    width: 100%
`;
export const ButtonText = styled.Text`
    color: ${white};
    font-size: 18px;
    text-align: center;
`;
export const BottomTextWrapper = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 20px;
`;
export const SignUpButton = styled.TouchableOpacity`
   color: ${purple};
`;
export const LinkText = styled.Text`
    color: ${secondary};
  font-size: 15px;
  text-decoration: underline;
`;
export const PlainText = styled.Text`
     color: ${gray};
    font-size: 15px;
`;

//signup contents
export const SignupContainer = styled.View`
   flex:1;
    background-color: ${white};
    padding: 30px 20px;
    position: relative;
    padding-top: 60px;
    background-color: transparent;
`;
export const BackArrowWrapper = styled.TouchableOpacity`
    margin-top: 30px;
    flex-direction: row;
    margin-top: 20px;
    margin-bottom:10px;
    align-items: center;
    justify-content: flex-start;
`;
export const BackArrowtIcon = styled.View`
    margin-top: 50px;
    margin-bottom: 0px;
    
`;
export const BackText = styled.Text`
    font-size: 14px;
    color: ${black};
    margin-left: 5px;
`;
export const CreateAccountTitle = styled(SubTitle)`
     font-size: 20px;
     margin-top: 20px;
     margin-bottom: 10px;
     color: ${secondary};
`;
export const PersonalDetailsSubtitle = styled(PageTitle)`
    font-size: 18px;
    margin-top: 0px;
    color:${secondary};
    letter-spacing: 1px;
    padding: 2px;
    text-align: left;
`;
export const SignupFormArea= styled(StyledFormArea)`
    width: 110%;
    margin-top: 20px;
    padding-right: 40px;
`;
export const SignUpTextInput = styled(StyledTextInput)`
    padding-left: 50px;
    color:${black};
    border-color: ${black};
`;
export const SignUpStyleInputLabel= styled(StyleInputLabel)`
`;
export const SignUpRightIcon = styled(RightIcon)`
`;
export const SignUpLeftIcon = styled.View`
    left: 10px;
    top: 40px;
    position: absolute;
    z-index: 1;
`;
export const SignInButton = styled(StyledButton)`
`;
export const SignInButtonText = styled(ButtonText)`
`;
export const SignUpBottomTextWrapper = styled(BottomTextWrapper)`
`;
export const LogInButton = styled(SignUpButton)`
`;
export const LogInLinkText = styled(LinkText)`
`;
export const LogInPlainText = styled(PlainText)`
`;
export const BodyMBackWrapper = styled.View`
`;



//image slider 

export const ProductContainer = styled.View`
    padding-top: 60px;
    background-color: ${white};
    flex: 1;
`;
export const PageScroll = styled.ScrollView`
    background-color: transparent;
    flex: 1;
`;
export const ImageSlider = styled.ScrollView`
  width: 100%;
  height: 320px;
background-color: transparent;
`;
export const SliderIndicatorWrapper = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    marginTop: 10px;
`;
export const Dash = styled.View`
  height: 6px;
  width: ${(props) => (props.$active ? '20px' : '15px')};
  background-color: ${(props) => (props.$active ? '#9747FF' : '#ccc')};
  border-radius: 2px;
  margin: 0 4px;
`;
export const ProductImage = styled.Image`
  width: 340px;
  height: 340px;
  margin-right: 10px;
  border-radius: 12px;
  background-color: transparent;
`;
//contents part
export const Content = styled.View`
  padding: 15px;
    background-color: transparent;
`;
export const ProductName = styled.Text`
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 10px;
`;
export const RightHeartIcon = styled(RightIcon)`
    top: 5px;
`;
export const ProductPrice = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${purple};
  margin-bottom: 15px;
`;

//color variation part
export const ColorRow = styled.View`
  flex-direction: row;
  margin-bottom: 0px;
`;

export const ColorCircle = styled.TouchableOpacity`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  margin-right: 10px;
`;
export const ColorWrapper = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    marginTop: 7px;
    margin-bottom: 0;
`;
 
//ratings 
export const RatingText = styled.Text`
  font-size: 14px;
  color: #555;
  margin-bottom: 16px;
`;


//product desc 
export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  margin-top: 20px;
`;
export const Description = styled.Text`
  font-size: 13px;
  line-height: 25px;
`;

//review sect editing rn huahuahauha
export const ReviewContainer = styled.View`
 padding: 15px;
 background-color: ${primary};
`;

export const ReviewItems = styled.View`
    flex-direction: row;
    margin-bottom: 20px;
`;
export const Avatar = styled.View`
    width: 38px;
    height: 38px;
    border-radius: 19px;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
`;
export const AvatarText = styled.Text`
    color: ${black};
    font-weight: bold;
`;
export const ReviewContent = styled.View`
    flex:1;
`;
export const ReviewerName = styled.Text`
  font-weight: 600;
  font-size: 14px;
`;
export const VariationText = styled.Text`
    color: ${gray};
    font-size: 12px;
    margin-bottom: 2px;
`;
export const StarRatings = styled.View`
    flex-direction: row;
    margin-bottom: 5px;
`;
export const CommentText = styled.Text`
    font-size: 13px;
    color: ${gray};
`;

// nav bar for product details
export const NavBar = styled.View`
    position: absolute;
    bottom: 0;
    left: 0;
    right:0;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding-vertical: 30px;
    background-color: ${white};
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    shadow-offset: 0px 4px;
    shadow-radius: 8px;
    elevation: 10;
`;

export const AddCartBtn = styled.TouchableOpacity`
    background-color: ${purple};
    padding-vertical: 17px;
    padding-horizontal: 30px;
    border-radius: 15px;
    margin-bottom: 25px;
    min-width: 150px;
    align-items: center;
`;
export const AddCartText = styled.Text`
    color: ${white};
    font-weight: bold;
    font-size: 15px;
`;

//shopping cart 

export const CartContainer = styled.View`
    flex:1;
    background-color: transparent;
    padding: 30px 20px;
    position: relative;
    padding-top: 60px;
`;
export const Header = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 30px;
`;

export const ShoppingCartTitle = styled.Text`
    font-size: 20px;
    font-weight:bold;
    text-align: center;

`;
export const CartItem = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${primary};
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 12px;
    elevation: 2;
`;
export const ItemImage = styled.Image`
    width: 60px;
    height: 60px;
    border-radius: 10px;
    margin-right: 15px;
`;
export const ItemInfo = styled.View`
    flex: 1;
    margin-left: 10px;
    justify-content: space-between;
`;
export const ItemDetails = styled.View`
    flex:1;
`;

export const ItemPrice = styled.Text`
    font-size: 14px;
    color: ${purple};
    margin-top: 4px;

`;
export const CartEmpty = styled.Text`
    text-align: center;
    font-size: 16px;
    color: ${gray};
    margin-top: 50px;
`;
export const ItemName = styled.Text`
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 15px;
`;
export const ItemQty = styled.Text`
    font-size: 14px;
    color: ${gray};
    margin-top: 5px;
`;
export const BackBtn = styled.TouchableOpacity`
    margin-right: 10px;
`;

export const TotalPrice = styled.Text`
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    color: ${black};
    text-align: left;
    padding-left: 40px;
`;
export const ItemFooter = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
`;
export const CartFooter = styled.View`
    flex-direction: column;
    position: absolute;
    bottom: 0;
    left: 0;
    right:0;
    padding-vertical: 30px;
    background-color:rgb(242, 242, 242);
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    shadow-offset: 0px 4px;
    shadow-radius: 8px;
    elevation: 10;
`;
export const CheckoutBtn = styled.TouchableOpacity`
    background-color: ${purple};
    padding: 18px;
    border-radius: 10px;
    align-items: center;
    margin-bottom: 30px;
    margin-horizontal: 30px;

`;
export const CheckoutText = styled.Text`
    color: ${white};
    font-weight: bold;
    font-size: 16px;
`;
export const QuantityControl = styled.View`
    flex-direction: row;
    align-items: center;
`;
export const QtyButton = styled.TouchableOpacity`
    padding: 0 10px;
`;
export const BackBtnPro = styled(BackBtn)`
    margin-right: 10px;
    padding-left: 20px;
`;

//adjustments

export const SignBackBtn = styled(BackBtn)`
`;
export const SignHeader = styled(Header)`
`;
export const SignTitle = styled(ShoppingCartTitle)`
`;