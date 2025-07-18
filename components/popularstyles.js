import styled from 'styled-components/native';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Colors } from './styles';

const { black, gray, secondary } = Colors;

export const FilterScroll = styled.ScrollView`
  margin-vertical: 10px;
  max-height: 40px;
`;

export const FilterButton = styled.TouchableOpacity`
  background-color: #fff;
  border: 1px solid ${secondary};
  padding: 8px 15px;
  margin-right: 5px;
  border-radius: 20px;
`;

export const FilterButtonText = styled.Text`
  color: ${black};
  font-size: 13px;
`;

export const ProductListWrapper = styled.View`
  flex: 1;
  width: 120%;
`;

export const ProductCard = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  flex: 0.5;
  elevation: 3;
`;

export const ProductImage = styled.Image`
  width: 100%;
  height: 130px;
  border-radius: 8px;
`;

export const ProductName = styled.Text`
  font-size: 13px;
  font-weight: 500;
  margin-top: 5px;
`;

export const ProductPrice = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${secondary};
`;

export const ProductMeta = styled.Text`
  font-size: 12px;
  color: ${gray};
  margin-top: 2px;
`;

export const ProductDelivery = styled.Text`
  font-size: 12px;
  color: green;
  margin-top: 2px;
`;
