import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../App';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface VerificationResult {
  isAuthentic: boolean;
  confidence: number;
  features: string[];
  suggestedPrice: number;
}

interface VerificationContextType {
  isVerifying: boolean;
  uploadImage: (file: File, productDetails: ProductDetails) => Promise<string | null>;
  verifyProduct: (imageUrl: string, productDetails: ProductDetails) => Promise<VerificationResult | null>;
  submitVerification: (
    imageUrl: string, 
    productDetails: ProductDetails, 
    result: VerificationResult
  ) => Promise<boolean>;
  getVerificationById: (id: string) => Promise<any>;
  getUserVerifications: () => Promise<any[]>;
}

interface ProductDetails {
  brand: string;
  model: string;
  category: string;
  description?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  serialNumber?: string;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, profile } = useAuth();

  const uploadImage = async (file: File, productDetails: ProductDetails): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to verify products');
      return null;
    }

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error uploading image');
      return null;
    }
  };

  const verifyProduct = async (
    imageUrl: string, 
    productDetails: ProductDetails
  ): Promise<VerificationResult | null> => {
    if (!user) {
      toast.error('You must be logged in to verify products');
      return null;
    }

    try {
      setIsVerifying(true);
      
      // This would be a call to an AI model in production
      // For MVP, we'll simulate the AI verification with a mock response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      // In production, this would come from the AI model
      const mockResult: VerificationResult = {
        isAuthentic: Math.random() > 0.3, // 70% chance of being authentic
        confidence: Math.floor(Math.random() * 30 + 70), // 70-99% confidence
        features: [
          'Authentic stitching pattern',
          'Correct logo placement',
          'Authentic materials',
          'Valid serial number',
          'Proper packaging'
        ],
        suggestedPrice: productDetails.purchasePrice 
          ? productDetails.purchasePrice * (Math.random() * 0.4 + 0.8) // 80-120% of purchase price
          : 0
      };

      return mockResult;
    } catch (error: any) {
      console.error('Error verifying product:', error);
      toast.error(error.message || 'Error verifying product');
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  const submitVerification = async (
    imageUrl: string, 
    productDetails: ProductDetails, 
    result: VerificationResult
  ): Promise<boolean> => {
    if (!user || !profile) {
      toast.error('You must be logged in to submit verifications');
      return false;
    }

    try {
      // Save the verification to the database
      const { error } = await supabase
        .from('verifications')
        .insert([{
          user_id: user.id,
          image_url: imageUrl,
          brand: productDetails.brand,
          model: productDetails.model,
          category: productDetails.category,
          description: productDetails.description || '',
          purchase_price: productDetails.purchasePrice || 0,
          purchase_date: productDetails.purchaseDate || null,
          serial_number: productDetails.serialNumber || '',
          is_authentic: result.isAuthentic,
          confidence: result.confidence,
          features: result.features,
          suggested_price: result.suggestedPrice,
          status: 'completed'
        }]);

      if (error) throw error;
      
      // Award tokens based on verification
      // This would interact with the smart contract in production
      // For MVP, we'll update the user's token balance in the database
      
      // Calculate token reward based on result confidence
      const tokenReward = Math.floor(result.confidence / 10);
      
      // Update user's token balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          tokens_balance: profile.tokens_balance + tokenReward,
          verification_count: (profile.verification_count || 0) + 1
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      toast.success(`Verification submitted successfully! Earned ${tokenReward} tokens.`);
      return true;
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.message || 'Error submitting verification');
      return false;
    }
  };

  const getVerificationById = async (id: string): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('verifications')
        .select(`
          *,
          profiles:user_id (
            username,
            reputation
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching verification:', error);
      toast.error(error.message || 'Error fetching verification');
      return null;
    }
  };

  const getUserVerifications = async (): Promise<any[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching user verifications:', error);
      toast.error(error.message || 'Error fetching verifications');
      return [];
    }
  };

  const value = {
    isVerifying,
    uploadImage,
    verifyProduct,
    submitVerification,
    getVerificationById,
    getUserVerifications
  };

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
};

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};