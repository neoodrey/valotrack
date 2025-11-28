from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.contrib.auth.models import User
from .models import Favorite, FavoriteWeapon 
from .serializers import FavoriteSerializer, FavoriteWeaponSerializer 

class FavoriteListCreate(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoriteDelete(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

class FavoriteWeaponListCreate(generics.ListCreateAPIView):
    serializer_class = FavoriteWeaponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteWeapon.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoriteWeaponDelete(generics.DestroyAPIView):
    serializer_class = FavoriteWeaponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteWeapon.objects.filter(user=self.request.user)

class MostFavoritedAgentsView(APIView):
    permission_classes = [permissions.AllowAny] 

    def get(self, request, format=None):
        total_users = User.objects.count()
        if total_users == 0:
            total_users = 1 

        top_agents = Favorite.objects.values(
            'agent_name', 
            'agent_uuid'
        ).annotate(
            count=Count('agent_uuid')
        ).order_by('-count')[:10]

        data = []
        for item in top_agents:
            percentage = (item['count'] / total_users) * 100
            data.append({
                'agent_name': item['agent_name'],
                'agent_uuid': item['agent_uuid'],
                'count': item['count'],
                'percentage': round(percentage, 1)
            })

        return Response(data, status=status.HTTP_200_OK)

class UserFavoritesSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        username = request.query_params.get('username', None)
        if not username:
            return Response(
                {"error": "A 'username' query parameter is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.filter(username__iexact=username).first()
        
        if not user:
            return Response(
                {"error": "User not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        favorites = Favorite.objects.filter(user=user)
        serializer = FavoriteSerializer(favorites, many=True)
        
        return Response(
            {'username': user.username, 'favorites': serializer.data}, 
            status=status.HTTP_200_OK
        )

class MostFavoritedWeaponsView(APIView):
    permission_classes = [permissions.AllowAny] 

    def get(self, request, format=None):
        total_users = User.objects.count()
        if total_users == 0:
            total_users = 1

        top_weapons = FavoriteWeapon.objects.values(
            'weapon_name', 
            'weapon_uuid'
        ).annotate(
            count=Count('weapon_uuid')
        ).order_by('-count')[:10]

        data = []
        for item in top_weapons:
            percentage = (item['count'] / total_users) * 100
            data.append({
                'weapon_name': item['weapon_name'],
                'weapon_uuid': item['weapon_uuid'],
                'count': item['count'],
                'percentage': round(percentage, 1)
            })

        return Response(data, status=status.HTTP_200_OK)