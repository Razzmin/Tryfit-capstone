import { LinearGradient} from "expo-linear-gradient";

const GradientBackground = (props) => (
    <LinearGradient
         colors={['#1f1926']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[{ flex: 1 }, props.style]}
    >
    {props.children}
  </LinearGradient>
    
);

export default GradientBackground;