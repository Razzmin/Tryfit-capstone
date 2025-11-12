import styled from "styled-components/native";
import Constants from "expo-constants";


const StatusBarHeight = Constants.statusBarHeight;

//palette
export const Colors = {
    primary: "#EDEDED",
    bg: "#382a47",
    secondary:"#5C427E",
    white: "#FFFFFF",
    black: "#000000",
    gray: "#717171",
    purple: "#9747FF",
    main: "#1f1926",
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
    text: "#bba1d4",
};
const {primary, secondary, white, black, gray, purple, text, bg, main} = Colors; 

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
export const LoadingOverlay = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255,255,255,0.3);
    justify-content: center;
    align-items: center;
    z-index: 999;
`;
export const StyledContainer = styled.View`
    flex: 1;
    padding: 20px;
    padding-top: ${StatusBarHeight +10}px;
    background-color: transparent;
    align-items: center;
    justify-content: center;
`;
//for the popular sc
export const PopularStyledContainer = styled(StyledContainer)`
     flex: 1;
     background-color: transparent;
     width: 100%;

`;
export const InnerContainer = styled.View`
    width: 90%;
    justify-content: center;
    align-items: center;
    margin-bottom: 50px;
`;
//for popu sc
export const PopularStyledInnerContainer = styled(InnerContainer)`
     flex: 1;
     background-color: transparent;
     width: 90%;
`;
export const PageLogo = styled.Image.attrs(() => ({
  resizeMode: "contain",
}))`
     width: 200px;
    height: 200px;
`;
export const PageTitle = styled.Text`
    font-size: 16px;
    color:${main};
    text-align: left;
    font-family: "KronaOne";
    align-self: flex-start;
    margin-top: 7px;
`;
export const SubTitle = styled.Text`
    font-size: 24px;
     margin-bottom: 2px;
     color: ${main};
     text-align: left;
     width: 100%;
     padding: 8px;
     font-family: "KronaOne";  
`;

export const StyledFormArea = styled.View`
    width: 110%;
    padding: 0 19px;
    margin-top: 10px;
`;

export const StyledTextInput = styled.TextInput`
    background-color: ${white};
    border-width: 1px;
    border-color: ${(props) => (props.isFocused ?   '#9747FF' : main)};
    padding: 10px 20px;
    padding-left: 55px;
    border-radius: 10px;
    font-size: 16px;
    height: 55px;
    margin-vertical: 6px;
    margin-bottom: 3px;
    color: ${main};
    width: 100%;
`;
export const StyleInputLabel = styled.Text`
    color: ${main};
    font-size: 15px;
    text-align: left;
`;
export const LeftIcon = styled.View`
    left: 15px;
    top: 40px;
    position: absolute;
    z-index: 1;
`;
export const RightIcon = styled.TouchableOpacity`
    right: 15px;
    top: 40px;
    position: absolute;
    z-index: 1;
`;
export const StyledButton = styled.TouchableOpacity`
    padding: 15px;
    background-color: ${purple};
    justify-content: center;
    border-radius: 10px;
    margin-vertical: 7px;
    height: 60px;
    width: 100%;
    font-family: "KronaOne";
    /**button animation */
    shadow-color: #000;
    shadow-offset: 0px 3px;
    shadow-opacity: 0.3;
    shadow-radius: 4px;
    elevation: 5;

`;
export const ButtonText = styled.Text`
    color: ${white};
    font-size: 15px;
    text-align: center;
   font-family: "KronaOne";
`;
export const BottomTextWrapper = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 90px;
`;
export const SignUpButton = styled.TouchableOpacity`
`;
export const LinkText = styled.Text`
    color: ${purple};
  font-size: 10px;
  text-decoration: underline;
  font-family: "KronaOne";
`;
export const PlainText = styled.Text`
     color: ${main};
    font-size: 10px;
    font-family: "KronaOne";
    
`;

//signup contents

export const SignupContainer = styled(StyledContainer)`
    background-color: transparent;
`;
export const CreateAccountTitle = styled.Text`
     font-size: 31px;
     margin-top: 20px;
     margin-bottom: 10px;
`;
export const PersonalDetailsSubtitle = styled(PageTitle)`
    font-size: 18px;
    margin-top: 0px;
    color:${secondary};
    letter-spacing: 1px;
    padding: 2px;
    text-align: left;
`;
export const SignupFormArea= styled.View`
    width: 110%;
    padding: 0 15px;
    margin-top: 10px;
`;
export const SignUpTextInput = styled.TextInput`
`;
export const SignUpStyleInputLabel= styled(StyleInputLabel)`
`;
export const SignUpRightIcon = styled(RightIcon)`
`;
export const SignUpLeftIcon = styled(LeftIcon)`
`;
export const SignInButton = styled(StyledButton)`
`;
export const SignInButtonText = styled(ButtonText)`
    font-family: "KronaOne";
    font-size: 18px;
`;
export const SignUpBottomTextWrapper = styled(BottomTextWrapper)`
`;
export const LogInButton = styled(SignUpButton)`
`;
export const LogInLinkText = styled(LinkText)`
     font-family: "KronaOne";
    font-size: 10px;
`;
export const LogInPlainText = styled(PlainText)`

    font-family: "KronaOne";
    font-size: 10px;
`;

export const ProductContainer = styled.View`
    padding-top: 40px;
    background-color: ${white};
    flex: 1;
`;

export const PageScroll = styled.ScrollView`
    background-color: transparent;
`;

//image slider
export const ImageSlider = styled.ScrollView`
  width: 100%;
  height: 320px;
background-color: transparent;
`;
export const SliderIndicatorWrapper = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
`;
export const Dash = styled.View`
  height: 6px;
  width: ${(props) => (props.$active ? '20px' : '15px')};
  background-color: ${(props) => (props.$active ? '#9747FF' : '#ccc')};
  border-radius: 2px;
  margin: 0 4px;
`;
export const ProductImage = styled.Image`
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
  font-size: 19px;
  margin-bottom: 10px;
  font-family: "KronaOne";
`;
export const RightHeartIcon = styled(RightIcon)`
    top: 5px;
`;
export const ProductPrice = styled.Text`
  font-size: 27px;
  font-weight: bold;
  color: #9747FF;
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
  font-size: 15px;
  color: #555;
  margin-left: 4px;

`;


//product desc 
export const SectionTitle = styled.Text`
  font-size: 17px;
  margin-bottom: 15px;
  margin-top: 10px;
  font-weight: bold;
`;
export const Description = styled.Text`
  font-size: 13px;
  line-height: 25px;
`;

//review sect editing rn huahuahauha
export const ReviewContainer = styled.View`
 padding: 5px;
 background-color: ${white};
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
    margin-right: 16px;
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
  margin-bottom: 3px;
`;
export const VariationText = styled.Text`
    color: ${gray};
    font-size: 12px;
    margin-bottom: 20px;
`;
export const StarRatings = styled.View`
    flex-direction: row;
    margin-bottom: 5px;
`;
export const CommentText = styled.Text`
    font-size: 14px;
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
    height: 105px,

`;

export const AddCartBtn = styled.TouchableOpacity`
    background-color: ${purple};
    padding-vertical: 18px;
    padding-horizontal: 30px;
    border-radius: 15px;
    margin-bottom: 25px;
    min-width: 150px;
    align-items: center;
`;
export const AddCartText = styled.Text`
    color: ${white};
    font-family: "KronaOne";
    font-size: 13px;
`;

//shopping cart 

export const CartContainer = styled.View`
    flex:1;
    background-color: transparent;
    padding: 30px 20px;
    position: relative;
    padding-top: 40px;
`;
export const Header = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;
`;

export const ShoppingCartTitle = styled.Text`
    font-size: 20px;
    font-weight:bold;
    text-align: center;

`;
export const CartItem = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${white};
    padding: 15px;
    width: 95%;
    margin-bottom: 15px;
    border-radius: 16px;
    elevation: 1;
    align-self: center;
`;
export const ItemImage = styled.Image`
    width: 80px;
    height: 80px;
    border-radius: 5px;
    margin-right: 10px;
`;
export const ItemInfo = styled.View`
    flex: 1;
    margin-left: 10px;
`;
export const ItemDetails = styled.View`
    flex:1;
`;

export const ItemPrice = styled.Text`
    font-size: 17px;
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
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 20px;
    margin-top: -6px;

`;
export const ItemSize = styled.Text`
    font-size: 13px;
    color: #555;
    margin-bottom: 15px;
    margin-top: -15px;
`;
export const ItemQty = styled.Text`
    font-size: 17px;
    color: ${main};
    margin-bottom: -15px;
    margin-top: -15px;
`;
export const BackBtn = styled.TouchableOpacity`
    margin-right: 10px;
`;

export const TotalPrice = styled.Text`
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 8px;
    color: ${black};
    margin-horizontal: 10px;

`;
export const ItemFooter = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
`;
export const CartFooter = styled.View`
    padding: 19px;
    position: absolute;
    bottom: 0;
    left: 0;
    right:0;
    padding-vertical: 20px;
    background-color:${white};
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    shadow-offset: 0px 4px;
    shadow-radius: 8px;
    elevation: 10;
`;
export const CheckoutBtn = styled.TouchableOpacity`
    background-color: ${purple};
    padding: 18px;
    border-radius: 10px;
    align-items: center;
    margin-bottom: 50px;
    margin-horizontal: 30px;

`;
export const CheckoutText = styled.Text`
    color: ${white};
    font-family: "KronaOne";
    font-size: 16px;
`;
export const QuantityControl = styled.View`
    flex-direction: row;
    align-items: center;
    padding-horizontal: 10px;

`;
export const QtyButton = styled.TouchableOpacity`
    height: 28px;
    border-radius: 4px;
    background-color: ${purple};
    width: 28px;
    justify-content: center;
    align-items: center;
    

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