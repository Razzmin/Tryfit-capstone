// components/cardstyle.js
import styled from 'styled-components/native';

export const ProductCard = styled.View`
  background-color: #edebebff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
`;

export const ProductImage = styled.Image`
  width: 100%;
  height: 180px;
  border-radius: 8px;
`;

export const ProductName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  margin-top: 5px;
`;

export const ProductPrice = styled.Text`
  font-size: 14px;
  color: green;
  margin-top: 3px;
`;

export const ProductMeta = styled.Text`
  font-size: 12px;
  color: #888;
  margin-top: 3px;
`;

export const ProductDelivery = styled.Text`
  font-size: 12px;
  color: #555;
  margin-top: 2px;
`;
