import { LinearGradient} from "expo-linear-gradient";

const GradientBackground = (props) => (
    <LinearGradient
         colors={['#E0BBFF', '#F3E5F5']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[{ flex: 1 }, props.style]}
    >
    {props.children}
  </LinearGradient>
    
);

export default GradientBackground;