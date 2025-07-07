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
  ]
};
const {primary, secondary, white, black, gray} = Colors; 

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
    background-color: ${secondary};
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

export const SignupContainer = styled(StyledContainer)`
    background-color: transparent;
`;
export const SignupInnerContainer = styled(InnerContainer)`
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
export const SignupFormArea= styled(StyledFormArea)`
    width: 110%;
    padding: 0 12px;
    margin-top: 25px;
`;
export const SignUpTextInput = styled(StyledTextInput)`
    padding-left: 30px;
    color:${black};
`;
export const SignUpStyleInputLabel= styled(StyleInputLabel)`
`;
export const SignUpRightIcon = styled(RightIcon)`
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
export const BodyMBackWrapper = styled(BackArrowWrapper)`
`
