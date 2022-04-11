import { gql } from '@apollo/client';
import { Reviews_ProductReviewsQueryResponse, Stripe_Product, Mutation } from './takeshape/types';

export interface StripeProducts {
  products: {
    items: Stripe_Product[];
  };
}

export const GetStripeProducts = gql`
  query GetStripeProductsQuery {
    products: getIndexedProductList(where: { active: { eq: true } }) {
      items {
        id
        name
        description
        images
        prices {
          id
          unitAmount: unit_amount
          currency
          recurring {
            interval
            intervalCount: interval_count
          }
        }
      }
    }
  }
`;

export const SearchStripeProducts = gql`
  query SearchStripeProductsQuery($query: String!) {
    products: search(terms: $query) {
      results {
        __typename
        ... on Stripe_Product {
          id
          name
          description
          images
          prices {
            id
            unitAmount: unit_amount
            currency
            recurring {
              interval
              intervalCount: interval_count
            }
          }
        }
      }
    }
  }
`;

export interface GetProductArgs {
  id: string;
}

export type GetProductResponse = {
  product: Stripe_Product;
  reviews: Reviews_ProductReviewsQueryResponse;
};

export const GetProduct = gql`
  query GetProduct($id: String!) {
    product: Stripe_getProduct(id: $id) {
      id
      name
      description
      images
      prices {
        id
        unitAmount: unit_amount
        currency
        recurring {
          interval
          intervalCount: interval_count
        }
      }
    }
    reviews: getProductReviews(sku: $id) {
      reviews {
        data {
          date_created
          timeago
          rating
          title
          review
        }
      }
      stats {
        average
        count
      }
    }
  }
`;

export const GetMyProfile = gql`
  query GetMyProfile {
    profile: getMyProfile {
      id
      email
      name
      bio
      avatar {
        path
      }
      customer: stripeCustomer {
        id
        name
        description
        address {
          line1
          line2
          city
          state
          postal_code
          country
        }
      }
    }
  }
`;

export const GetMyLoyaltyCard = gql`
  query GetMyLoyaltyCard {
    getMyLoyaltyCard {
      id
      code
      campaign
      loyalty_card {
        points
        balance
      }
      assets {
        qr {
          id
          url
        }
      }
    }
  }
`;

export type UpsertMyProfileResponse = {
  profile: Mutation['upsertMyProfile'];
};

export const UpsertMyProfile = gql`
  mutation UpsertMyProfile($name: String, $bio: String, $avatarId: String) {
    profile: upsertMyProfile(name: $name, bio: $bio, avatarId: $avatarId) {
      id
      email
      name
      bio
      avatar {
        path
      }
      customer: stripeCustomer {
        id
        name
        description
        address {
          line1
          line2
          city
          state
          postal_code
          country
        }
      }
    }
  }
`;

export const UploadAssets = gql`
  mutation UploadAssets($files: [TSFile]!) {
    uploadAssets(files: $files) {
      uploadUrl
      asset {
        _id
        _version
        filename
      }
    }
  }
`;

export const UpsertMyCustomer = gql`
  mutation UpsertMyCustomer($name: String, $description: String, $address: Stripe_CustomerAddressPropertyInput) {
    customer: upsertMyCustomer(name: $name, description: $description, address: $address) {
      id
      name
      description
      address {
        line1
        line2
        city
        state
        postal_code
        country
      }
    }
  }
`;

export const CreateMyCheckoutSession = gql`
  mutation CreateMyCheckoutSession(
    $redirectUrl: String!
    $lineItems: [Stripe_CheckoutSessionLineItemsPropertyInput!]!
    $mode: String!
  ) {
    session: createMyCheckoutSession(lineItems: $lineItems, redirectUrl: $redirectUrl, mode: $mode) {
      id
    }
  }
`;

export const GetMySubscriptions = gql`
  query GetMySubscriptionsQuery {
    subscriptions: getMySubscriptions(
      expand: ["data.items", "data.plan.product", "data.latest_invoice.payment_intent"]
    ) {
      id
      current_period_end
      items {
        data {
          id
          price {
            currency
            unitAmount: unit_amount
            product {
              id
              name
              description
              images
            }
            recurring {
              interval
            }
          }
        }
      }
    }
  }
`;

export const DeleteMySubscription = gql`
  mutation DeleteMySubscription($subscriptionId: String!) {
    subscription: deleteMySubscription(subscriptionId: $subscriptionId) {
      id
      status
    }
  }
`;

export const GetMyPayments = gql`
  query GetMyPaymentsQuery {
    payments: getMyPayments(limit: 5, expand: ["data.invoice"]) {
      id
      amount
      currency
      created
      invoice {
        ... on Stripe_Invoice {
          object
          id
          lines {
            data {
              id
              amount
              currency
              quantity
              price {
                product {
                  id
                  description
                  name
                  images
                }
              }
            }
          }
        }
      }
      session {
        object
        id
        line_items {
          data {
            id
            amount_total
            currency
            quantity
            price {
              product {
                id
                description
                name
                images
              }
            }
          }
        }
      }
      shipment {
        tracking_number
        tracking_status
      }
    }
  }
`;

export const QueueReviewInvitation = gql`
  mutation QueueReviewInvitationMutation(
    $name: String
    $email: String
    $orderId: String
    $products: [Reviews_ProductInput]
  ) {
    queueReviewInvitation(name: $name, email: $email, orderId: $orderId, products: $products) {
      status
      messages
    }
  }
`;

export const GetMyNewsletterSubscriptons = gql`
  query GetMyNewsletterSubscriptionsQuery {
    newsletters: getMyNewsletterSubscriptions {
      listId
      listName
      subscribed
    }
  }
`;

export const SubscribeToNewsletter = gql`
  mutation SubscribeToNewsletterMutation($listId: String!, $email: String!) {
    Klaviyo_addMembers(list_id: $listId, input: { profiles: [{ email: $email }] }) {
      items {
        id
      }
    }
  }
`;

export const UnsubscribeFromNewsletter = gql`
  mutation UnsubscribeFromNewsletterMutation($listId: String!, $email: String!) {
    Klaviyo_removeMembers(list_id: $listId, input: { emails: [$email] }) {
      result
    }
  }
`;

export const CreateLoyaltyCardOrder = gql`
  mutation CreateLoyaltyCardOrder(
    $email: String
    $amount: Float
    $status: String
    $items: [Voucherify_OrderItemInput]
  ) {
    order: Voucherify_createOrder(email: $email, amount: $amount, status: $status, items: $items) {
      id
    }
  }
`;

/**
 * ShipEngine Shipments
 */

export const CreateShipment = gql`
  mutation CreateShipment(
    $carrier_id: String
    $service_code: String
    $external_shipment_id: String
    $ship_to: ShipEngine_AddressInput
    $ship_from: ShipEngine_AddressInput
    $packages: [ShipEngine_PackageInput]
  ) {
    createShipment(
      carrier_id: $carrier_id
      service_code: $service_code
      external_shipment_id: $external_shipment_id
      ship_to: $ship_to
      ship_from: $ship_from
      packages: $packages
    ) {
      shipment_id
    }
  }
`;
